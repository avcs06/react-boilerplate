const getSchema = require('./base');
// const { Schema } = require('mongoose');
// const relationship = require('mongoose-relationship');

const SampleModel = getSchema({
    unique: ['id'],
    schema: {
        // childReference: { type: Schema.Types.ObjectId, ref: 'ChildModel' },
        // parentReference: { type: Schema.Types.ObjectId, ref: 'ParentModel', childPath: 'key' },
        id: Number
    }
});

// SampleModel.plugin(relationship, { relationshipPathName: 'parentReference'});

module.exports = SampleModel;
