import {handler} from "./main.js";

const event = {
    'body' : JSON.stringify({
        'fun': 'naverStock',
        'room': 'room02',
        'sender': 'Leo',
        'message': '주 삼성전자'
    })
}

handler(event).then((value) => {
    console.log(value)
})

