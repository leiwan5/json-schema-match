const test = require('ava');
const jsonSchemaMatch = require('../');

test('is required but not defined', t => {
    const s1 = {
	  "type": "object",
	  "required": [
	    "title",
	    "tasks"
	  ],
	  "properties": {
	    "title": {
	      "type": "string"
	    },
	    "tasks": {
	      "type": "array",
	      "items": {
		"type": "object",
		"required": [
		  "title",
		  "details",
		  "done"
		],
		"properties": {
		  "title": {
		    "type": "string"
		  },
		  "details": {
		    "type": "string"
		  },
		  "done": {
		    "type": "boolean"
		  }
		}
	      }
	    }
	  }
	};
    const s2 = {
	  "type": "object",
	  "required": [
	    "title",
	    "tasks"
	  ],
	  "properties": {
	    "title": {
	      "type": "string"
	    },
	    "tasks": {
	      "type": "array",
	      "items": {
		"type": "object",
		"required": [
		  "title",
		  "details",
		  "done"
		],
		"properties": {
		  "details": {
		    "type": "string"
		  },
		  "done": {
		    "type": "boolean"
		  }
		}
	      }
	    }
	  }
	};
    try {
        jsonSchemaMatch(s1, s2);
    } catch(e) {
        t.is(e.message, '#/properties/tasks/items/properties/title is required but not define');
    }
});

test('is required but not exist', t => {
    const s1 = {
	  "type": "object",
	  "required": [
	    "firstName",
	    "lastName",
	    "age",
	    "telephone",
	    "title",
	    "tasks"
	  ],
	  "properties": {
	    "firstName": {
	      "type": "string"
	    },
	    "lastName": {
	      "type": "string"
	    },
	    "age": {
	      "type": "integer"
	    },
	    "telephone": {
	      "type": "string"
	    },
	    "title": {
	      "type": "string"
	    },
	    "tasks": {
	      "type": "array",
	      "items": {
		"type": "object",
		"required": [
		  "details",
		  "done"
		],
		"properties": {
		  "details": {
		    "type": "string"
		  },
		  "done": {
		    "type": "boolean"
		  }
		}
	      }
	    }
	  }
        };
    const s2 = {
	  "type": "object",
	  "required": [
	    "firstName",
	    "lastName",
	    "age",
	    "telephone",
	    "title",
	    "tasks"
	  ],
	  "properties": {
	    "firstName": {
	      "type": "string"
	    },
	    "lastName": {
	      "type": "string"
	    },
	    "age": {
	      "type": "integer"
	    },
	    "telephone": {
	      "type": "string"
	    },
	    "title": {
	      "type": "string"
	    },
	    "tasks": {
	      "type": "array",
	      "items": {
		"type": "object",
		"required": [
                  "title",
		  "details",
		  "done"
		],
		"properties": {
		  "title": {
		    "type": "string"
		  },
		  "details": {
		    "type": "string"
		  },
		  "done": {
		    "type": "boolean"
		  }
		}
	      }
	    }
	  }
	};
    try {
        jsonSchemaMatch(s1, s2);
    } catch(e) {
        t.is(e.message, 'Schema Context Error: #/properties/tasks/items/properties/title is required but not exist');
    }
});
