const _ = require('lodash');
const Ajv = require('ajv');
const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

// check if x contain's output values that y requires
const match = {
    schema(x, y, context = { path: '#' }) {
        const newContext = _.assign({}, context);
        if (context.path === '#') {
            ajv.compile(x);
            ajv.compile(y);
            _.assign(newContext, { rootX: x, rootY: y });
        }
        const parsedX = match.parse(x, newContext.rootX);
        const parsedY = match.parse(y, newContext.rootY);
        // if is not empty Object
        if(parsedY.type) {
            match.type(parsedX.type, parsedY.type, newContext);
            if(match[parsedX.type]) {
                match[parsedX.type](parsedX, parsedY, newContext);
            } else {
                throw new Error(`Unknown type ${parsedY.type}`);
            }
        }
        return true;
    },
    parse(x, root) {
        if (_.has(x, '$ref')) {
            const path = x.$ref.substr(2).replace('/', '.');
            const ref = match.parse(_.get(root, path), root);
            return _.assign({}, ref);
        } else {
            return _.assign({}, x);
        }
    },
    type(x, y, context) {
        if (x !== y) throw new Error(`${context.path}: type not match`);
    },
    enum(x = [], y = [], context) {
        // x 可以是 y 的子集
        if (_.difference(x, y).length > 0) throw new Error(`${context.path}: enum not match`);
    },
    string(x, y, context) {
        match.enum(x.enum, y.enum, context);
    },
    number(x, y, context) {
        match.enum(x.enum, y.enum, context);
    },
    integer(x, y, context) {
    },
    boolean(x, y, context) {
    },
    object(x, y, context) {
        const xp = x.properties;
        const yp = y.properties;
        const xk = _.keys(xp);
        const xr = x.required || [];
        const yk = _.keys(yp);
        const yr = y.required || [];
        if(_.difference(yr, yk).length > 0) {
            throw new Error(`${context.path}/properties/${_.difference(yr, yk)} is required but not define`);
        }
        for(const p of yk ) {
            // xr && !xe
            if (xr.indexOf(p) > -1 && !xp[p]) {
                throw new Error(`Merging Schema Context Error: ${context.path}/properties/${p} is required but not exist`);
            // yr && !ye
            } else if (yr.indexOf(p) > -1 && !yp[p]) {
                console.log('this should not happen');
                throw new Error(`InputSchema Error: ${context.path}/properties/${p} is required but not define`);
            // !xr && !xe && yr && ye
            } else if (xr.indexOf(p) === -1 && !xp[p] && yr.indexOf(p) > -1 && yp[p]) {
                throw new Error(`Schema Context Error: ${context.path}/properties/${p} is required but not exist`);
            // xe && ye
            } else if (xp[p] && yp[p]) {
                match.schema(xp[p], yp[p], _.assign({}, context, { path: context.path + '/properties/' + p }));
            }
        }
    },
    array(x, y, context) {
        if (!_.has(x, 'items') || !_.has(y, 'items')) throw new Error(`${context}: items should be defined`);
        match.schema(x.items, y.items, _.assign({}, context, { path: context.path + '/items' }));
    },
}

module.exports = match.schema;

