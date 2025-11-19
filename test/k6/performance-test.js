import http from 'k6/http';

import { sleep, check, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const options = {
    vus: 10,
    duration: '20s',
    //iterations: 1,
    thresholds: {
        http_req_duration: ['p(95)<=2000', 'p(99)<=3000'],
        http_req_failed: ['rate<0.01']
    }
};

export default function () {
    let token = ''

    group('Login de usuário', function () {
        let responseUserLogin = http.post(
            'http://localhost:3000/api/users/login',
            JSON.stringify({
                email: 'alice@email.com',
                password: '123456'
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        check(responseUserLogin, {
            'login status deve ser igual a 200': (res) => res.status === 200
        });

        token = responseUserLogin.json('token')
    })

    group('Realizando checkout', function () {
        let responseCheckout = http.post(
            'http://localhost:3000/api/checkout',
            JSON.stringify({
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    }
                ],
                freight: 15,
                paymentMethod: 'boleto'
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        check(responseCheckout, {
            'checkout status deve ser igual a 200': (res) => res.status === 200,
            'checkout deve retornar valorFinal': (res) => res.json('valorFinal') !== undefined
        });
    })

    group('Simulando pensamento do usuário', function () {
        sleep(1); // User think time
    })
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}