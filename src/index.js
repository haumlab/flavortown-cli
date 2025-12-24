#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const readline = require('readline');
const api = require('./api');
const config = require('./config');

const program = new Command();

program
  .name('flavortown')
  .description('CLI for Hack Club Flavortown')
  .version('1.0.0');

const checkAuth = () => {
  if (!config.getApiKey()) {
    console.log(chalk.yellow('API Key not found!'));
    console.log(`Please run ${chalk.cyan('flavortown setup')} to configure your API key.`);
    console.log(`You can get your API key by going to ${chalk.bold('Settings')} in Flavortown, generating it, and copying it.`);
    process.exit(1);
  }
};

program
  .command('setup')
  .description('Configure your API key')
  .action(async () => {
    console.log(chalk.cyan('How to get your API key:'));
    console.log(`1. Go to ${chalk.bold('Settings')} in Flavortown.`);
    console.log('2. Click on "Generate API Key".');
    console.log('3. Copy the key and paste it below.');
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(chalk.bold('Enter your API key: '), (key) => {
      if (key.trim()) {
        config.setConfig({ apiKey: key.trim() });
        console.log(chalk.green('\nAPI key saved successfully!'));
      } else {
        console.log(chalk.red('\nNo key entered. Setup cancelled.'));
      }
      rl.close();
    });
  });

program
  .command('whoami')
  .description('Show current configuration')
  .action(() => {
    const key = config.getApiKey();
    if (key) {
      const masked = key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
      console.log(`${chalk.green('Logged in with API Key:')} ${masked}`);
    } else {
      console.log(chalk.yellow('Not logged in. Run "flavortown setup" to get started.'));
    }
  });

program
  .command('logout')
  .description('Clear your API key')
  .action(() => {
    config.setConfig({ apiKey: null });
    console.log(chalk.green('Logged out successfully. API key cleared.'));
  });

// Projects
const projects = program.command('projects').description('Manage projects');

projects
  .command('list')
  .description('List all projects')
  .option('-p, --page <number>', 'Page number', '1')
  .option('-q, --query <string>', 'Search query')
  .option('-s, --sort <type>', 'Sort by: title, date', 'date')
  .action(async (options) => {
    checkAuth();
    try {
      const data = await api.getProjects(options.page, options.query);
      let items = Array.isArray(data) ? data : (data.projects || data.data || []);
      
      if (items.length === 0) {
        console.log(chalk.yellow('No projects found.'));
        return;
      }

      // Sorting
      items.sort((a, b) => {
        if (options.sort === 'title') return a.title.localeCompare(b.title);
        if (options.sort === 'date') return new Date(b.created_at) - new Date(a.created_at);
        return 0;
      });

      items.forEach((p) => {
        const date = new Date(p.created_at).toLocaleDateString();
        console.log(`${chalk.green(p.id.toString().padEnd(3))} ${chalk.bold(p.title)} ${chalk.dim(`(${date})`)}`);
        console.log(`    ${chalk.italic(p.description || 'No description')}`);
        if (p.repo_url) console.log(`    Repo: ${chalk.cyan(p.repo_url)}`);
        console.log('');
      });

      console.log(chalk.dim(`Showing ${items.length} projects.`));
    } catch (error) {
      console.error(chalk.red('Error fetching projects:'), error.message);
    }
  });

projects
  .command('get <id>')
  .description('Get project details')
  .action(async (id) => {
    checkAuth();
    try {
      const p = await api.getProject(id);
      console.log(chalk.bold.green(p.title));
      console.log(p.description);
      console.log(`Repo: ${p.repo_url || 'N/A'}`);
      console.log(`Demo: ${p.demo_url || 'N/A'}`);
      console.log(`Readme: ${p.readme_url || 'N/A'}`);
    } catch (error) {
      console.error(chalk.red('Error fetching project:'), error.message);
    }
  });

// Devlogs
const devlogs = program.command('devlogs').description('Manage devlogs');

devlogs
  .command('list <projectId>')
  .description('List devlogs for a project')
  .option('-p, --page <number>', 'Page number', '1')
  .action(async (projectId, options) => {
    checkAuth();
    try {
      const data = await api.getDevlogs(projectId, options.page);
      const items = Array.isArray(data) ? data : (data.devlogs || data.data || []);

      if (items.length === 0) {
        console.log(chalk.yellow('No devlogs found for this project.'));
        return;
      }

      items.forEach((d) => {
        const date = new Date(d.created_at).toLocaleDateString();
        const body = d.body.length > 100 ? d.body.substring(0, 100) + '...' : d.body;
        console.log(`${chalk.green(d.id.toString().padEnd(3))} ${chalk.dim(date)}`);
        console.log(`    ${body}`);
        console.log(`    ${chalk.red('❤')} ${d.likes_count} | ${chalk.blue('💬')} ${d.comments_count}`);
        console.log('');
      });

      console.log(chalk.dim(`Showing ${items.length} devlogs.`));
    } catch (error) {
      console.error(chalk.red('Error fetching devlogs:'), error.message);
    }
  });

devlogs
  .command('get <projectId> <id>')
  .description('Get devlog details')
  .action(async (projectId, id) => {
    checkAuth();
    try {
      const d = await api.getDevlog(projectId, id);
      const date = new Date(d.created_at).toLocaleString();
      console.log(chalk.bold.green(`Devlog #${d.id} - ${date}`));
      console.log('─'.repeat(40));
      console.log(d.body);
      console.log('─'.repeat(40));
      console.log(`${chalk.red('❤')} ${d.likes_count} Likes | ${chalk.blue('💬')} ${d.comments_count} Comments`);
      console.log(`Duration: ${chalk.yellow(d.duration_seconds)}s`);
      if (d.scrapbook_url) console.log(`URL: ${chalk.cyan(d.scrapbook_url)}`);
    } catch (error) {
      console.error(chalk.red('Error fetching devlog:'), error.message);
    }
  });

// Store
const store = program.command('store').description('Manage store');

store
  .command('list')
  .description('List store items')
  .option('-s, --sort <type>', 'Sort by: price-asc, price-desc, name', 'price-asc')
  .option('-q, --search <query>', 'Search items by name or description')
  .option('-t, --type <type>', 'Filter by item type')
  .option('--no-group', 'Disable item grouping')
  .action(async (options) => {
    checkAuth();
    try {
      const data = await api.getStoreItems();
      let allItems = Array.isArray(data) ? data : (data.items || data.data || []);
      
      if (allItems.length === 0) {
        console.log(chalk.yellow('No store items found.'));
        return;
      }

      // Create a map for quick lookup
      const itemMap = new Map(allItems.map(item => [item.id, item]));
      
      // Build a relationship graph
      const childrenOf = new Map(); // Parent ID -> Set of Child IDs
      const parentsOf = new Map();  // Child ID -> Set of Parent IDs

      const isAccessory = (item) => item && item.type && (item.type.includes('Accessory') || item.type.includes('Upgrade'));

      allItems.forEach(item => {
        if (item.attached_shop_item_ids) {
          item.attached_shop_item_ids.forEach(linkedId => {
            const linkedItem = itemMap.get(linkedId);
            if (!linkedItem) return;

            let parent, child;
            
            // Logic to determine who is the parent and who is the child
            // 1. If one is an accessory and the other isn't, the non-accessory is the parent
            if (isAccessory(item) && !isAccessory(linkedItem)) {
              parent = linkedItem;
              child = item;
            } else if (!isAccessory(item) && isAccessory(linkedItem)) {
              parent = item;
              child = linkedItem;
            } else {
              // 2. If both are same type, the more expensive one is usually the parent
              const priceA = item.ticket_cost ? item.ticket_cost.base_cost : 0;
              const priceB = linkedItem.ticket_cost ? linkedItem.ticket_cost.base_cost : 0;
              if (priceA >= priceB) {
                parent = item;
                child = linkedItem;
              } else {
                parent = linkedItem;
                child = item;
              }
            }

            if (!childrenOf.has(parent.id)) childrenOf.set(parent.id, new Set());
            childrenOf.get(parent.id).add(child.id);

            if (!parentsOf.has(child.id)) parentsOf.set(child.id, new Set());
            parentsOf.get(child.id).add(parent.id);
          });
        }
      });

      let itemsToDisplay = allItems;

      // Search filter
      if (options.search) {
        const query = options.search.toLowerCase();
        itemsToDisplay = itemsToDisplay.filter(item => 
          item.name.toLowerCase().includes(query) || 
          (item.description && item.description.toLowerCase().includes(query))
        );
      }

      // Type filter
      if (options.type) {
        const type = options.type.toLowerCase();
        itemsToDisplay = itemsToDisplay.filter(item => item.type && item.type.toLowerCase() === type);
      }

      // Sorting
      const sortFn = (a, b) => {
        const priceA = a.ticket_cost ? a.ticket_cost.base_cost : 0;
        const priceB = b.ticket_cost ? b.ticket_cost.base_cost : 0;

        if (options.sort === 'price-asc') return priceA - priceB;
        if (options.sort === 'price-desc') return priceB - priceA;
        if (options.sort === 'name') return a.name.localeCompare(b.name);
        return 0;
      };

      itemsToDisplay.sort(sortFn);

      if (itemsToDisplay.length === 0) {
        console.log(chalk.yellow('No items matched your filters.'));
        return;
      }

      const renderedRootIds = new Set();

      const renderItem = (item, indent = 0, branchIds = new Set()) => {
        // Prevent infinite recursion in case of circular links
        if (branchIds.has(item.id)) return;
        const newBranchIds = new Set(branchIds);
        newBranchIds.add(item.id);

        const prefix = ' '.repeat(indent);
        const price = item.ticket_cost ? item.ticket_cost.base_cost : 'N/A';
        const stock = item.stock === null ? chalk.dim('Unlimited') : (item.stock === 0 ? chalk.red('Out of Stock') : item.stock);
        
        // Clean up type name
        let typeName = item.type || '';
        if (typeName.startsWith('ShopItem::')) {
          typeName = typeName.replace('ShopItem::', '');
        }
        const type = typeName ? chalk.blue(`[${typeName}]`) : '';

        console.log(`${prefix}${chalk.green(item.id.toString().padEnd(3))} ${chalk.bold(item.name)} ${type}`);
        console.log(`${prefix}    ${chalk.italic(item.description || 'No description')}`);
        console.log(`${prefix}    Cost: ${chalk.yellow(price)} tickets | Stock: ${stock}`);
        if (item.limited) console.log(`${prefix}    ${chalk.red('⚠ Limited Edition')}`);
        
        // Render attached items if grouping is enabled
        if (options.group && childrenOf.has(item.id)) {
          const attached = Array.from(childrenOf.get(item.id))
            .map(id => itemMap.get(id))
            .filter(child => child && !branchIds.has(child.id))
            .sort(sortFn);
          
          if (attached.length > 0) {
            console.log(`${prefix}    ${chalk.dim('↳ Upgrades/Options:')}`);
            attached.forEach(child => renderItem(child, indent + 6, newBranchIds));
          }
        }
        
        if (indent === 0) console.log('');
      };

      itemsToDisplay.forEach((item) => {
        // If grouping is on, only start rendering from top-level items (those with no parents)
        if (options.group && parentsOf.has(item.id)) return;
        
        if (renderedRootIds.has(item.id)) return;
        renderedRootIds.add(item.id);
        
        renderItem(item);
      });

      console.log(chalk.dim(`Showing ${allItems.length} items (including grouped options).`));
    } catch (error) {
      console.error(chalk.red('Error fetching store items:'), error.message);
    }
  });

store
  .command('get <id>')
  .description('Get store item details')
  .action(async (id) => {
    checkAuth();
    try {
      const item = await api.getStoreItem(id);
      const price = item.ticket_cost ? item.ticket_cost.base_cost : 'N/A';
      const stock = item.stock === null ? chalk.dim('Unlimited') : (item.stock === 0 ? chalk.red('Out of Stock') : item.stock);
      
      console.log(chalk.bold.green(item.name));
      if (item.type) console.log(chalk.blue(`Type: ${item.type}`));
      console.log('─'.repeat(40));
      console.log(item.long_description || item.description || 'No description available.');
      console.log('─'.repeat(40));
      console.log(`Cost: ${chalk.yellow(price)} tickets`);
      console.log(`Stock: ${stock}`);
      if (item.max_qty) console.log(`Max Qty: ${item.max_qty}`);
      if (item.one_per_person_ever) console.log(chalk.red('Limit: One per person ever'));
      if (item.image_url) console.log(`Image: ${chalk.cyan(item.image_url)}`);
    } catch (error) {
      console.error(chalk.red('Error fetching store item:'), error.message);
    }
  });

program.parse(process.argv);
