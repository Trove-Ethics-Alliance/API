const log = require('../Addons/Logger');
const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');

async function loadAPIRoutes(app) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        log.debug('[LOAD ROUTES] Started loading api routes.');

        // Create a new table
        const table = new AsciiTable('API Routes v1');
        table.setHeading('Status', 'Path Name', 'File');

        // Set this variable to false by default.
        let routeBoolean = false;

        try {
            // Load API Routes files.
            const apiRouteFiles = await glob('Routes/**/*.js');

            for (const file of apiRouteFiles) {
                try {

                    // Get full path to the button file.
                    const route_dir_root = path.join(process.cwd(), file);

                    // Assign variable to the API Route file.
                    const apiRoute = require(route_dir_root);

                    // Check if apiRoute has router.
                    if (!apiRoute.router) continue;

                    // String with the API Route, method and file name.
                    let routePath;

                    // Loop through the API Route files and fill the routePath string for table row.
                    for (let index = 0; index < apiRoute.router.stack.length; index++) {

                        // Get the route methods toUpperCase string.
                        const methodObject = apiRoute.router.stack[index].route.methods;

                        // Get the route method name to upper case string.
                        const METHOD = Object.keys(methodObject)[0]?.toUpperCase();

                        // Make a routePath string with formatted paths and methods.
                        routePath = routePath ? `${routePath} [${METHOD}:${apiRoute.router.stack[index].route.path}]` : `[${METHOD}:${apiRoute.router.stack[index].route.path}]`;
                    }

                    // Add table row for this API Route.
                    table.addRow(
                        apiRoute.enabled ? 'ENABLED' : 'DISABLED',
                        routePath,
                        file.split('/').slice(-4).join('/')
                    );

                    // Check if API Route is enabled.
                    if (!apiRoute.enabled) continue;

                    // Load Enabled Routes.
                    app.use('/v1', apiRoute.router);

                    // Indicate whether at least one route is enabled.
                    routeBoolean = true;

                } catch (error) {
                    reject(`Error loading API Route files ${error.message}`);
                }
            }

            // Send a log command when there are no Routes loaded.
            if (!routeBoolean) {
                resolve('[LOAD ROUTES] ❌ No enabled API Routes were found.');
            } else {
                resolve(table.toString());
            }
        } catch (error) {
            reject(`Error loading API Route files ${error.message}`);
        }

        log.debug('🆗 [LOAD ROUTES] Finished loading API Routes Handler.');
    });
}

module.exports = loadAPIRoutes;