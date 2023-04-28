export function ApiCaller(baseAdress, endPoint){
    this.baseAdress = baseAdress;
    this.endPoint = endPoint;

    this.getAll = async function() {
        return await fetch(`${baseAdress}${endPoint}`)
            .then(res => res.json())
            .then(data => data)
    }

    this.postTodo = async function(task, type, isFinished) {
        await fetch(`${baseAdress}${endPoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({task, type, isFinished})
        })
    }

    this.finishTodo = async function(id, isFinished) {
        await fetch(`${baseAdress}${endPoint}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({isFinished})
        });
    }

    this.unfinishTodo = async function(id, isFinished) {
        await fetch(`${baseAdress}${endPoint}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({isFinished})
        });
    }

    this.deleteTodoFromDb = async function(id) {
        await fetch(`${baseAdress}${endPoint}/${id}`, {
            method: "DELETE"
        });
    }

    this.updateExistingTodo = async function(id, task, type, isFinished){
        await fetch(`${baseAdress}${endPoint}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({task, type, isFinished})
        });
    };
}