import output from '../../rollup.config.template.js';
import config from './package.json';

export default output(config.name);
