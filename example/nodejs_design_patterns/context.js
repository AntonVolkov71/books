/*
{
    function makeF() {
        const x = 11
        const y = 22

        return function (what) {
            switch (what) {
                case 'x':
                    return x;
                case 'y':
                    return y;
            }
        }
    }

    const f = makeF()
    console.log(f('x'))
}

*/
{
    function foo(){
        let sum = 0

        for (let i = 0; i < 1000; i++) {
            sum+= Math.sqrt(i)
        }

    }
}