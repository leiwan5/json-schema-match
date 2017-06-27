const _ = require('lodash');
const Ajv = require('ajv');
const ajv = new Ajv();

const match = {
    schema(x, y, context = { path: '#' }) {
        const newContext = _.assign(context);
        if (context.path === '#') {
            ajv.compile(x);
            ajv.compile(y);
            _.assign(newContext, { rootX: x, rootY: y });
        }
        const parsedX = match.parse(x, newContext.rootX);
        const parsedY = match.parse(y, newContext.rootY);
        match.type(parsedX.type, parsedY.type, newContext);
        match[parsedX.type](parsedX, parsedY, newContext);
        return true;
    },
    parse(x, root) {
        if (_.has(x, '$ref')) {
            const path = x.$ref.substr(2).split('/').join('.');
            const ref = match.parse(_.get(root, path), root);
            return _.assign({}, ref);
        } else {
            return _.assign({}, x);
        }
    },
    type(x, y, context) {
        if (x !== y) throw(`${context.path}: type not match`);
    },
    enum(x = [], y = [], context) {
        // x 可以是 y 的子集
        if (_.difference(x, y).length > 0) throw(`${context.path}: required not match`);
    },
    string(x, y, context) {
        match.enum(x.enum, y.enum, context);
    },
    number(x, y, context) {
        match.enum(x.enum, y.enum, context);
    },
    required(x = [], y = [], context) {
        // x 可以是 y 的子集
        if (_.difference(x, y).length > 0) throw(`/${context.path}: required not match`);
    },
    properties(x, y, context) {
        for (const p of _.keys(x)) {
            match.schema(x[p], y[p], _.assign(context, { path: context.path + '/' + p }));
        }
    },
    object(x, y, context) {
        match.required(x.required, y.required, context);
        match.properties(
            _.omit(x.properties, x.required),
            _.omit(y.properties, x.required),
            context);
    },
    array(x, y, context) {
        if (!_.has(x, 'items') || !_.has(y, 'items')) throw(`${context}: items should be defined`);
        match.schema(x.items, y.items, _.assign(context, { path: context.path + '/items' }));
    },
}

module.exports = match.schema;
