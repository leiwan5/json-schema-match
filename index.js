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
        return true;
    },
    number(x, y, context) {
        match.enum(x.enum, y.enum, context);
        return true;
    },
    integer(x, y, context) {
        return true;
    },
    boolean(x, y, context) {
        return true;
    },
    object(x, y, context) {
        const xp = x.properties;
        const yp = y.properties;
        const yk = _.keys(yp);
        const yr = y.required || [];
        if(_.difference(yr, yk).length > 0) {
            throw new Error(`${context.path}/properties/${_.difference(yr, yk)} is required but not used`);
        }
        for(const p of yk ) {
            // if y.p is required
            if(yr && yr.indexOf(p) !== -1) {
                //  if y.p is required && x.p does not exist
                if(!xp[p]) {
                    throw new Error(`${context.path}/properties/${p} is required but not exist`);
                }
                //  if y.p is required && x.p exist
                match.schema(xp[p], yp[p], _.assign({}, context, { path: context.path + '/properties/' + p }));
            // if y.p is not required
            } else {
                // if y.p is not required && x.p exist && x.p.type is different with y.p.type
                if(xp[p] && xp[p].type != yp[p].type) {
                    throw new Error(`${context.path}/${p}'s type should be ${yp[p].type}`);
                }
            }
        }
    },
    array(x, y, context) {
        if (!_.has(x, 'items') || !_.has(y, 'items')) throw new Error(`${context}: items should be defined`);
        match.schema(x.items, y.items, _.assign({}, context, { path: context.path + '/items' }));
    },
}

module.exports = match.schema;

