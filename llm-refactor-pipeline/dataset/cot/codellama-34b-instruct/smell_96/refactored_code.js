// This is the current behavior: store body as decoded JSON.
    expect(recorded[0]).to.deep.include({ body: exampleBody })

    // This is the desired behavior: store the body as encoded JSON. The second
    // test shows desired behavior: store body as encoded JSON so that JSON
    // strings can be correctly matched at runtime. Because headers are not
    // stored in the recorder output, it is impossible for the loader to
    // differentiate a stored JSON string from a non-JSON body.
    // expect(recorded[0]).to.include({ body: JSON.stringify(exampleBody) })