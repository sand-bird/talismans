const b = Buffer.allocUnsafe(50).fill('h')

// Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
console.log(b.toString())

b.fill(0, 10, 25)
console.log(b)
