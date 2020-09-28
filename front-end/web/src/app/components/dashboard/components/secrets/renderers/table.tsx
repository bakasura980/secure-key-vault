import React from 'react';

export const TableRenderer = function (context: any) {
    const secretsView = []
    for (let i = 0; i < context.state.secrets.length; i++) {
        const secret = context.state.secrets[i]

        secretsView.push(
            <tr>
                <td onClick={() => { context.revealSecret(i, secret.value) }}>
                    <span className="default-text">{secret.name.length > 20 ? secret.name.substr(0, 20) + '...' : secret.name}</span>
                    <span className="extra-text">Reveal</span>
                </td>

                <td>
                    <span className="default-text">{secret.value.length > 20 ? secret.value.substr(0, 20) + '...' : secret.value}</span>
                    <span className="extra-text">{secret.value}</span>
                </td>
            </tr>
        );
    }

    return (
        <table className="container">
            <thead>
                <tr>
                    <th><h1>Secret Name</h1></th>
                    <th><h1>Secret Value</h1></th>
                </tr>
            </thead>
            <tbody>
                {secretsView}
            </tbody>
        </table>
    );
}
