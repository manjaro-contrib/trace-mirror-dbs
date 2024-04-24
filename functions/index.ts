type Env = {
    KV: KVNamespace;
};

export const onRequest: PagesFunction<Env> = async (context) => {
    return Response.json({
        hello: "world",
    }, {
        headers: {
            "content-type": "application/json",
        },
    });
};