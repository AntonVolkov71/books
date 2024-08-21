const fs = require('fs')
/*
{
    // Замыкание
    function init(surname) {
        function displayName(name) {
            console.log(surname + ' ' + name)
        }

        return displayName
    }

    const surnameVolkov = init('Volkov')

    const inna = surnameVolkov.bind(surnameVolkov, 'Inna')
    surnameVolkov('Anton')
    surnameVolkov('Diana')

    inna()
}


{
    // Синхронность
    function add(a, b, callback) {
        callback(a + b)
    }

    console.log('before',)
    add(1, 2, res => console.log('res', res))
    console.log('after',)
}

{

    // Асинхронность
    console.log('',)

    function additionAsync(a, b, callback) {
        setTimeout(() => callback(a + b))
    }

    console.log('before',)
    additionAsync(1, 2, res => console.log('res', res))
    console.log('after',)
    console.log('after2',)
    console.log('after3',)
}
*/
{
    // Непредсказуемая функция
    console.log('',)
    const cache = {}

    function inconsistentRead(filename, callback) {
        if (cache[filename]) {
            callback(cache[filename]) // синхронная
        } else {
            // асинхронная
            fs.readFile(filename, 'utf8', (err, data) => {
                cache[filename] = data
                callback(data)
            })
        }
    }

    const file = 'test.txt'
    inconsistentRead(file, res => console.log('res', res))

    // иначе cache еще будет пустой fs.readFile - асинхронная и будет вызвана после callback
    setTimeout(() => {
        inconsistentRead(file, res => console.log('res', res))
    })

    // Использование неправильной функции
    function createFileReader(filename) {
        const listeners = []

        inconsistentRead(filename, value => {
            listeners.forEach(listener => listener(value))
        })

        return {
            onDataReady: listener => listeners.push(listener)
        }
    }

    const reader1 = createFileReader(file)

    reader1.onDataReady(data => {
        console.log('First call data:', data)

        const reader2 = createFileReader(file)

        // так как внутренний вызов reader2 синхронный, но обработчик не зарегистрируется?!
        // и не будут вызваны
        reader2.onDataReady(data => {
            console.log('Second call data', data)
        })
    })
}