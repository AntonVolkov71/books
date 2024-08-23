## Глава 1 Платформа Node.js

- 'use strict' строгий режим
  - невозможно использовать необъявленные переменные
  - невозможно удалить переменные функции, аргументы

- стрелочные функции - для использования родительского this
  - setTimeout(function(){},0) - использует свой this
    - вместо setTimeout(function(){},0).bind(this) - setTimeout(()=>{},0)

- Map, Set 
  - хешированные коллекции, где ключом может быть что угодно (функция, объект и т.д.)
  - перебор for..of, Map -> [key, value] и извлекаются в том же порядке как были сохранены

- WeakMap, WeakSet
  - отсутствует перебор
  - сборщик мусора, если ключ был объект и его удалили, то удаляет из коллекции

### Асинхронная природа Node.js
- серверы, созданные с использованием этой среды, не ожидают завершения операций ввода-вывода, прежде чем продолжить выполнение других задач.
- подразумевает наличие неблокирующего ввода-вывода, что позволяет в процессе ожидания ответа на запрос, например, к базе данных, выполнять другие операции и обрабатывать другие запросы.

### Reactor
- кратко, приложение в некоторый момент желает обратиться к ресурсу (без блокировки) и передает обработчика,
 который должен быть вызван некогда в будущем, после завершения операции

- > Приложение Node.js завершиться автоматически, когда в демультиплексоре событий не останется отложенных операций и событий в очереди
- низкоуровневая С-библиотека libuv обеспечивает программный интерфейс для создания циклов событий, управления очередью событий,
выполнения асинхронных операций ввода/вывода и организации очереди заданий разных типов

- **Основные блоки**
  - набор привязок для libuv
  - движок V-8
  - node-core - ядро библиотеки JavaScript

## Глава 2 Основные шаблоны
- Синхронное - последовательные вычисления, операция блокируется до её завершения
- Асинхронное - операция переводится в фоновой режим, сразу выполняется следующая

### Шаблон Callback
- **обратные вызовы (Callback)** - функции, вызываемые для передачи результата операции, вместо return (return синхронный)

#### Замыкания 
- это комбинация функции и лексическое окружение в котором функция была определена
- создается каждый раз при создании функции

#### Стиль передачи продолжений Continuation-Passing Style, CPS
- обратный вызов функции, переданную в аргументе другой функции вызываемой после завершения операции
- function add(a, b, callback){ callback(a + b) }

#### Обратный вызов не связанный со стилем передачи продолжений. Прямой стиль
- перебор map - синхронный!!! 
```
  const result = [1, 5, 7].map(el => el - 1)
  console.log(res) // [0, 5, 6]
```
- > Важно определять Синхронный или Асинхронный программный интерфейс

* Для прямого стиля (синхронного) нет смысла использовать вызовы с продолжением

- > Используйте прямой стиль при создании синхронных функций
- > Синхронный стиль блокирует приложение. Ломает модель параллельной обработки JavaScript
- > Использование синхронного ввода/вывода не рекомендовано во многих случаях. Только при нескольких 
статических файлах.
- > Для чтения конфигурационных файлов при загрузке ОБЯЗАТЕЛЬНО Синхронный стиль 
```
  const cache = {}

    function consistentReadSync(filename){
        if(cache[filename]){
            return cache[filename]
        } else {
            cache[filename] = fs.readFileSync(filename, 'utf8') // Синхронная
            return cache[filename]
        }
    }
```

### Перевод синхронного операции в асинхронную
- добавить отложенный вызов в 'process.nextTick' - process.nextTick(()=> callback(cache[filename]))
- отложенные обратные вызовы методом nextTick, выполняются доя любых событий ввода/вывода
- При этом, 'setImmediate' помещает в очередь за уже находящимися в очереди событиями ввода/вывода

### Соглашения об обратных вызовах при использовании CPS
- callback передается последним в списке параметров (последний аргумент), даже при наличии необязательных параметрах
  - fs.readFile(filename, [options], callback)
- ошибки передаются первыми
  - стараться всегда передавать ошибку типа Error, а не строку
  - для прерывания операции можно возвращать обратный вызов, чтобы предотвратить дальнейшее выполнение метода
  - fs.readFile('foo.txt.', 'utf8', (err, data)=> if(err) {return callback(err)} else {callback(null, data)}
  
### Ошибки и исключения
- в Синхронном стиле ошибки передаются throw
- в Асинхронном стиле ошибка передается через обратный вызов в  цепочке
- Исключение перехваченное внутри асинхронного обратного вызова, будет передано циклу событий и никогда не достигнет обратного вызова
  - поэтому в асинхронном стиле используем try catch и передаем ошибке в обратный вызов, а не throw
- можно перехватить в цикле событий через событие 'uncaughtException'
- Желательно, а лучше Обязательно завершать приложение после перехвата событием 'uncaughtException'
```
    process.on('uncaughtException', err=>{
      console.log('My catch error:', err.message )
      process.exit(1)
    })
```

## Система модулей
- в JS отсутствует пространство имен, программы, выполняемые в глобальной области видимости захламляют ее внутренними дынными и зависимостями
- шаблон для решения проблемы "Revealing Module" - "Открытий модуль"

```
   const module = (() => {
        const privateFoo = () => {
        }
        const privateBar = []

        const exported = {
            publicFoo: () => {
            },
            publicBar: () => {
            }
        }

        return exported
   })
    
   console.log('module', module())
    
```

### CommonJS modules
- аналог шаблона с открытым модулем
- каждый модуль запускается в собственной области видимости и не загрязняет глобальную область
- Плохой способ самодельного загрузчика модуля использовать eval как запуск исходного кода из файла
- для определения глобальной переменной используют 'global' - Плохая практика!!

- > Require в JS Синхронный, если необходимо асинхронный необходимо экспортировать неинициализированный модуль
при этом не гарантируется его готовности к использованию!

- **Загрузка модулей по версиям**
  - сначала модуль в файлах <moduleName>.js, <moduleName>/index.js
  - потом модуль ядра Node.js 
  - модуль в пакетах node_modules

- > Require - кеширует вызов модуля!!!!!!!!
  > 

- **Именованный экспорт** - большинство модулей в ядре Node.js использует именно так
```
  // logger.js
  exports.info = (message)=>{
    console.log('info:', message )
  }

  exports.verbose = (message)=>{
      console.log('verbose:', message)
  }
  
  // main.js
  const logger = require("./logger");
  
  logger.info('message for info')
  logger.verbose('message for verbose')
```

- **Экспорт функций**
- расширение как использование пространства имен
- шаблон "substack" - экспортируйте основные функциональные возможности модуля в виде единственной функции.
Экспортированная функция используется как пространство имен для прочих вспомогательных возможностей
```
  // loggerModule.js
  module.exports = (message)=>{
    console.log('module info: ', message)
  }
  
  // вспомогательная возможность
  module.exports.verbose = (message)=>{
      console.log('module verbose: ',message )
  }
  
  // main.js
  const loggerModule = require("./loggerModule");
  
  loggerModule('message for info')
  loggerModule.verbose('message for verbose')
  
```

- **Экспорт конструктора**
  - можно прототипами можно class то же самое
  - экспорт конструктора или класса является единственной точкой входа
```
  // loggerContructor.js
  function Logger(name){
      this.name = name
  }
  
  Logger.prototype.log = function (message) {
      console.log('log:', message)
  }
  
  Logger.prototype.info = function (message) {
      console.log('info:', message)
  }
  
  Logger.prototype.verbose = function (message) {
      console.log('verbose:', message)
  }

  module.exports = Logger
  
  // main.js
  const loggerConstructor = require("./loggerConstructor");
  
  const dbLogger = new loggerConstructor('DB')
  dbLogger.info('DB message for info')

  const accessLogger = new loggerConstructor('ACCESS')
  accessLogger.verbose('ACCESS message for verbose')
```
  - для вызова без new, можно использовать проверку на существование ссылки this
  - можно использовать синтаксический сахар new.target
```
   // loggerContructor.js
    function Logger(name){
      if(!this instanceof Logger){
        return new Logger(name)
      }
      
      /* синтаксический сахар new.target
      if(!new.target){
        return new Logger(name)
      }
      */
      
      this.name = name
    }
    
    module.exports = Logger
  
  // main.js
  const dbLogger = Logger('DB');
```

- **Экспорт экземпляра как Singleton и обычный**
```
  module.exports = new Logger('DEFAULT')
  module.exports.Logger = Logger
```

## Шаблон Observer - Наблюдатель
- определяет объект (называемый субъектом), способный уведомить ряд наблюдателей (или обработчиков) об изменении своего состоянии
- может уведомить нескольких наблюдателей

### Класс EventEmitter
- встроен в Node.js ('events'.EventEmitter) - и реализует шаблон Observer
- методы
  - on(event, listener) - регистрация обработчика для заданного типа события
  - once(event, listener) - тоже самое что 'on', только обработчик удаляется после 1 события
  - emit(event, [arg1],[...]) - создает событие и определяет доп аргументы для обработчика
  - removeListener(event, listener) - удаление обработчика для заданного типа события
- обязательно регистрировать обработчик ошибок, иначе ошибка потеряется в цикле событий

```
    // Простая реализация функции с EventEmitter
    function findPattern(files, regex) {
        const emitter = new EventEmitter()

        files.forEach(function (file) {
            fs.readFile(file, 'utf8', (err, content) => {
                if (err) {
                    return emitter.emit('error', err)
                }

                emitter.emit('fileread', file)

                let match;

                if (match = content.match(regex)) {
                    match.forEach(elem => emitter.emit('found', file, elem))
                }
            })
        })

        return emitter
    }

    findPattern(
        ['fileA.txt', 'fileB.json'],
        /hello/g
    )
        .on('fileread', file => console.log(file, 'was read'))
        .on('found', (file, match) => console.log('matched', match, 'in file', file))
        .on('error', err => console.log('Error My:', err))
```

```
    // EventEmitter реализация своего класса
    class FindPattern extends EventEmitter {
        constructor(regex) {
            super();
            this.regex = regex
            this.files = []
        }

        addFile(file) {
            this.files.push(file)
            return this
        }

        find() {
            this.files.forEach(file => {
                fs.readFile(file, 'utf8', (err, content) => {
                    if (err) {
                        return this.emit('error', err)
                    }

                    this.emit('fileread', file)

                    let match;

                    if (match = content.match(this.regex)) {
                        match.forEach(elem => this.emit('found', file, elem))
                    }
                })
            })

            return this
        }
    }

    const findPatternObject = new FindPattern(/hello/g)
    findPatternObject
        .addFile('fileA.txt')
        .addFile('fileB.json')
        .find()
        .on('fileread', file => console.log(file, 'was read'))
        .on('found', (file, match) => console.log('matched', match, 'in file', file))
        .on('error', err => console.log('Error My:', err))
```

### EventEmitter синхронные и асинхронные события
- не мешать синхронный и асинхронные стили вместе
- Необходимо зарегистрировать обработчики до того, как EventEmitter начнет посылать события, иначе обработчик не отработает

```
    // Синхронное события
    class SyncEmit extends EventEmitter {
        constructor() {
            super();
            this.emit('ready')
        }
    }

    const syncEmit = new SyncEmit()

    // обработчик регистрируется после отправки события
    // НЕ ОТРАБОАТАЕТ
    syncEmit.on('ready', ()=> console.log('Object is ready'))
```

### EventEmitter или обратные вызовы
- эквивалентны оба подхода, разница в читаемости
- EventEmitter более гибкий из-за типов событий, и несколько раз вызова события,
- callback при этом можно вызвать один раз
- EventEmitter может уведомить нескольких наблюдателей
```
    function helloEvents() {
        const emitter = new EventEmitter()

        setTimeout(() =>
                emitter.emit('hello', 'hello from emitter'),
            100
        )

        return emitter
    }

    function helloCallback(callback) {
        setTimeout(() => callback('hello fom callback'), 99)
    }
```

### EventEmitter вместе с обратными вызовами
```
    // Совместное использование EventEmitter & callback
    // где (error, files)=> ) обратный вызов
    glob('file/*.txt', (error, files)=> console.log('All files found', JSON.stringify(files)))
        .on('match', match => console.log('Match found', match))
```

## Глава 3 Шаблоны асинхронного выполнения с обратными вызовами

### Ад обратных вызовов
```
asyncFoo( err => {
    asyncBar( err => {
        asyncFooBar( err => {
            //...
          });
        });
    });
```