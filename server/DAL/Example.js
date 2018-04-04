import getSchema from './base';
import { Schema } from 'mongoose';
import relationship from 'mongoose-relationship';

const SampleModel = getSchema({
    unique: ['id'],
    schema: {
        childReference: { type: Schema.Types.ObjectId, ref: 'ChildModel' },
        parentReference: { type: Schema.Types.ObjectId, ref: 'ParentModel', childPath: 'key' },
        id: Number
    }
});

SampleModel.plugin(relationship, { relationshipPathName: 'parentReference'});

export default SampleModel;
