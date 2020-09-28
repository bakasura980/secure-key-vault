import React from 'react';

export const NewSecretRenderer = function (context: any) {
    return (
        <div className="bar">
            <button type="button" className="btn full-width" onClick={context.addSecret}>Add Secret</button>
            <input type="text" className="form-control input" onChange={context.onSecretNameAdding} placeholder="Secret Name" />
            <input type="text" className="form-control input" onChange={context.onSecretValueAdding} placeholder="Secret Value" />
        </div>
    );
}