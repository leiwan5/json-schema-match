const test = require('ava');
const jsonSchemaMatch = require('../');

test('work', t => {
    const s1 = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    $ref: '#/definitions1/user'
                }
            },
            currentUser: {
                $ref: '#/definitions1/user'
            },
            previousUser: {
                $ref: '#/properties/currentUser'
            },
        },
        definitions1: {
            user: {
                type: 'object',
            }
        },
    };
    const s2 = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    $ref: '#/definitions1/user'
                }
            },
            currentUser: {
                $ref: '#/definitions1/user'
            },
            previousUser: {
                $ref: '#/properties/currentUser'
            },
        },
        definitions1: {
            user: {
                type: 'object',
            }
        },
    };
    t.is(jsonSchemaMatch(s1, s2), true);
});
