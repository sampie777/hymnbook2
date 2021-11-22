export const DocumentSchema = {
    name: "Document",
    properties: {
        id: "int",
        name: "string",
        content: "string",
        language: "string",
        index: "int",
        createdAt: "date",
        modifiedAt: "date",
    },
    primaryKey: "id"
};

export const DocumentGroupSchema = {
    name: "DocumentGroup",
    properties: {
        id: "int",
        name: "string",
        language: "string",
        groups: "DocumentGroup[]",
        items: DocumentSchema.name + "[]",
        createdAt: "date",
        modifiedAt: "date",
    },
    primaryKey: "id"
};
