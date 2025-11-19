import http from 'k6/http';

import { sleep, check, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const options = {
    vus: 10,
    duration: '20s',
    //iterations: 1,
    thresholds: {
        http_req_duration: ['p(90)<=2', 'p(90)<=3'],
        http_req_failed: ['rate<0.01']
    }
};

export default function () {
    let token = ''

    group('Login de instrutor', function () {
        let responseInstructorLogin = http.post(
            'http://localhost:3000/instructors/login',
            JSON.stringify({
                email: 'warlley@warlley.com',
                password: '123456'
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        token = responseInstructorLogin.json('token')
    })

    group('Criando uma lição', function () {
        let responseLesson = http.post(
            'http://localhost:3000/lessons',
            JSON.stringify({
                title: 'Como montar uma flauta transversal',
                description: 'Montando as três partes da flauta transversal e alinhando as peças'
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        check(responseLesson, {
            'status deve ser igual a 201': (res) => res.status === 201
        });
    })

    group('Simulando pensamento do usuário', function () {
        sleep(1); // User think time
    })
} //commit

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}