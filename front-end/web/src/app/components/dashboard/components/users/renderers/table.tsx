import React from 'react';

export const TableRenderer = function (context: any) {
    const usersView = []
    for (let i = 0; i < context.state.authorized.length; i++) {
        const user = context.state.authorized[i]

        usersView.push(
            <tr>
                <td onClick={() => { context.unauthorize(i, user.user) }}>
                    <span className="default-text">{user.user.substr(0, 20)}...</span>
                    <span className="extra-text">Unauthorize</span>
                </td>

                <td>
                    <span className="default-text">{user.encShare.substr(0, 20)}...</span>
                    <span className="extra-text">{user.encShare}</span>

                </td>
            </tr>
        );
    }

    return (
        <table className="container">
            <thead>
                <tr>
                    <th><h1>Users</h1></th>
                    <th><h1>Encrypted Shares</h1></th>
                </tr>
            </thead>
            <tbody>
                {usersView}
            </tbody>
        </table>
    );
}
