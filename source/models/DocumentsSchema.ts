export const DocumentSchema = {
    name: "Document",
    properties: {
        id: "int",
        name: "string",
        html: "string",
        language: "string",
        index: "int",
        createdAt: "date",
        modifiedAt: "date",
        group: {
            type: "linkingObjects",
            objectType: "DocumentGroup",    // DocumentGroupSchema.name
            property: "items"
        }
    },
    primaryKey: "id"
};

export const DocumentGroupSchema: Realm.ObjectSchema = {
    name: "DocumentGroup",
    properties: {
        id: "int",
        name: "string",
        language: "string",
        groups: "DocumentGroup[]",
        items: DocumentSchema.name + "[]",
        size: "int",
        createdAt: "date",
        modifiedAt: "date",
        isRoot: "bool"
        // parent: {
        //     type: "linkingObjects?",
        //     objectType: "DocumentGroup",    // DocumentGroupSchema.name
        //     property: "groups",
        //     default: null,
        // }
    },
    primaryKey: "id"
};
