import React from 'react';

export const AuthorizeRenderer = function (context: any) {
    return (
        <div className="bar">
            <button type="button" className="btn full-width" onClick={context.authorize}>Authorize User</button>
            <input type="text" className="form-control input" onChange={context.onAddressAdding} placeholder="User Address" />
            <input type="text" className="form-control input" onChange={context.onPubKeyAdding} placeholder="User Public Key" />
        </div>
    );
}
