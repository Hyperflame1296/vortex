// Vortex language example
/*
    this file demonstrates most of the language features
    this language can use an interpreter, or be compiled to JavaScript, which doesn't exist yet
    compiler will be implemented in the future, trust me

    semicolons are optional in most places
*/

// access & edit Node.js variables from Vortex
NodeJS.process.stdout.write('hi')

Console::print(process.argv) // prints to console

// variable types
int a = 0
float b = 0.0
// dynamic types can change type at any time, and can be set to anything
// still can't do 'hi' + 5 tho, or 5 + 'hi'
dynamic c = 0
dynamic d = 'hi'
dynamic[] e = [1, 2, 'a']
string f = 'hi'
bool g = true
int[] h = [1, 2, 3]
const int i = 5 // constant variable, cannot be changed later
map j = {
    key1: 'value',
    key2: 5
}

// conditional keywords
if b >= 0 && b != 2 {
    Console::print('condition 1 satisfied')
} else if b == 0 {
    Console::print('condition 2 satisfied')
} else {
    Console::print('no conditions satisfied')
}

// loop keywords
for int i of [0 - 10] {
    Console::print(i) // logs numbers from 0 to 9
}

for int i = 0; i < 10; i++ {
    Console::print(i) // also logs numbers from 0 to 9
}

each dynamic val in e {
    Console::print(val) // logs each value in array e
}

while a < 10 {
    a += 1
    Console::print(a) // logs numbers from 1 to 10
}

// function definition and call
func add(double x, double y) -> double { // '-> double' is optional, it's just the return type
    return x + y
}

double result = add(5.5, 4.0) // returns 9.5
Console::print(result)

// namespaces & classes
class a {
    public int b // public variables can be accessed outside the class
    private int c // private variables can only be accessed within the class
    func d() {
        Console::print('method d called')
    }
    /*
       entry runs when the class is created
       (you can only have one of these)
    */
    entry() {
        Console::print('class a created!')
    }
}
namespace b {
    // you can have multiple classes in a namespace
    class i {
        func a() {
            Console::print('method a called')
        }
        entry() {
            Console::print('class i created!')
        }
    }
    class j {
        func a() {
            Console::print('method b called')
        }
        entry() {
            Console::print('class j created!')
        }
    }
}
instance obj = new b::a()

obj.d() // calls method d
// you cannot just do obj.main() again to call the constructor again.

// error handling
try {
    int x = 5 * 'hi' // can't multiply an integer and a string, so this throws
    string y = 5 + 'hi' // doesn't work either
} catch (err) {
    Console::print(`an error occurred: ${err}`)
}

// you can also do this (not safe, but it's useful if the errors that go through don't matter)
try {
    int x = 5 * 'hi' // can't multiply an integer and a string, so this throws
    string y = 5 + 'hi' // doesn't work either
} ignore // ignores the error