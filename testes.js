async function example() {
    let promise = new Promise((resolve, reject) => {
        resolve("Entrou aqui fi.");
    })
    console.log(1);
    let result = await promise;
    console.log(result);
    console.log(result);
    console.log(3);
}

example();