import React from 'react';

export const HomePageRenderer = function (context: any) {
    return (
        <div >
            <h1>Key Vault</h1>
            <div className="new-key-vault-div">
                <button type="button" className="btn" onClick={context.newKeyVault}>New Key Vault</button>
                <button type="button" className="btn" onClick={context.getPublicKey}>Get public key</button>
            </div>
            <form className="form-inline center">
                <button type="button" className="btn" onClick={context.existingKeyVault}>Existing Key Vault</button>
                <input type="text" className="form-control input" onChange={context.onExistingAddressAdding} placeholder="Key Vault Address" />
            </form>
        </div >
    );
}
