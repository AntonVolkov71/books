## Глава 8 Тестирование

**Init (module)** - мальенький участок тестирования (метод, класс)

**Service** - что-то маленькое целое.
    - СДС - consumer-driven-contracts - тест по контрактам
    - эксплуатационные - микросервис, регистрация и т.д.

**Сквозное** (UI) - вся система

Больше UI - дальше выпуск, тяжелее найти ошибку
**Unit** - больше, быстрее дебаг, но не известно работает ли вся система

**Лучашя середина:**
Unit - 40-80%
Service - 20-30%
UI - 1-5%

### Веерное тестирование:
Service_1 -> Unit->Service-> 
                             ->       UI
Service_2 -> Unit->Service-> 

### Сервисы тестирования:
    - локально установить
        - mountebank
        - pact
    - JVM
        - Spring Cloud Contract

**Дымовое тестирование** - в рамках развертывания и проверки запуска

Канареечное - выборочное на части пользьзователей

**CRF** - cross-functional-requirements (кросс функциональное - не функции)
    - задержка передачи по сети
    - производительность
    - скорость
    - имитация сбоев (сетевых)

CRF - достаточно 1 раз в неделю

--- 

## Глава 9 Мониторинг

**Наблюдаемость** - степень, в которой можно понять внутренне состояние, основываясь на внешних данных

Система сама выдает выходные данные -log, metrics

### Агрегация логов

    экзепляр    локально   | период отсылка   
    экзепляр    ---> логи  |  ------------>   логи
    экзепляр               |
    
    - возможность в агрегированных логам фильтровать по составу сообщения

#### Состав логов
    - id вызова (путь процедуры, даже если несколько микросервисов) 
    - дата, время
    - имя микросервиса
    - уровень лога

##### Пример записи лога
    - 15-02-2024 16:00:01 Order INFO [abc-123] Customer Message
    - [abc-123] - id вызова

### Сервисы мониторинга:
    - Humio
    - Datadog

### С чего начать мониторниг:
    - ифно о хостах, где запущены микросервисы
    - скорость отклика микросервиса

**Синтетические транзакции** - исуктвенные операции (вместо пользователя)
    - собирают всю информацию
    - используются как тест

### SLI - service level indicator
    - индикатор сервиса услуг
    - показатель, что делает ПО
        - время отклика
        - регистрация клиента
        - размещение заказа

--- 

## Глава 10 Безопасность

**Принцип наименьших привелегий** - минимальный доступ на конкретный период, с минимальной функциональностью

### Средства контроля:

**Превентивный** - предотвращение (безопасное хранение ключей, шифрование)
**Детективный**  - оповещение об атаке
**Реагирующий**  - реакция во время/после атаки

### Разбивка на зоны

    общедоступная <-- <----
                    |     |
    частная --------|     |
    частная <--------     |
                    |     |
    секретная-------|-----|

От секретной к частной и общедоступной, НО НЕ НАОБОРОТ

### Принципы
    - упрощенные данные, обрезанные (например, последние цифры IP)
    - имя, пол, например без возраста, только чтение
    - хранить данные в зашифрованном виде
    - делать бекапы данных тоже в зашифрованном виде
```
    Если вы не храниет данные, никто не сможет их украсть и не сможет запростиь.
    
    Лучше научиться восстановить систему, чем пытаться избегать падения.
```

---

## Глава 10 Отказоустойчивость
