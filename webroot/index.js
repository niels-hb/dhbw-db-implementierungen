
// LOGIC
// Get string how to identiy a node (for graph links)
TreeNode.prototype.getNodeIdentifier = function () { return this.values[0] }

/*
  Transform node to Viz string elements
    - vizNode describes node
    - vizLink describes links to node's children
*/
TreeNode.prototype.toViz = function () {
    let vizNode = `node${this.getNodeIdentifier()}[label = "`
    let vizLink = ''
    for (let i = 0; i < this.values.length; i++) {
        vizNode += `<f${i}> | ${this.values[i]} |`
        if (this.children && this.children.length > 0 && this.children[i]) {
            vizLink += `"node${this.getNodeIdentifier()}":f${i} -> "node${this.children[i].getNodeIdentifier()}"\n`
        }
    }
    vizNode += `<f${this.values.length}>"];\n`
    if (this.children && this.children.length > 0 && this.children[this.values.length]) {
        vizLink += `"node${this.getNodeIdentifier()}":f${this.values.length} -> "node${this.children[this.values.length].getNodeIdentifier()}"`
    }
    return { vizNode, vizLink }
}

// Recursively apply toViz, generating an array of all toViz return values using pre-order
TreeNode.prototype.traverseNodesViz = function () {
    let res = this.toViz()
    let resArr = res instanceof Array ? res : [res]
    if (this.children && this.children.length > 0) {
        this.children.forEach(child => { resArr = resArr.concat(child.traverseNodesViz()) })
    }
    return resArr
}

// Build the complete Viz string for a tree, incl. static components
Tree.prototype.toViz = function () {
    if (!this.root || !this.root.children || this.root.values.length == 0) {
        return "digraph g{ }"
    }
    let arr = this.root.traverseNodesViz()
    let n = ""
    let l = ""
    arr.forEach(el => {
        n += el.vizNode
        l += el.vizLink
    })
    const data_str = [n, l].join("\n")
    return `digraph g{
        node [shape = record,height=.1];
        ${data_str}
    }`
}

Tree.prototype.reset = function () {
    this.root = new TreeNode(this)
}

/** History of a tree, lists all steps */
class TreeHistory {
    /** Create new tree history */
    constructor() {
        this.history = []
    }
    /**
     * @returns HTML (Bootstrap) table of the history (rows only)
     */
    toHtml() {
        let str = ""
        this.history.forEach(elem => {
            str += `<tr>
                <td>${elem.step}</td>
                <td>${elem.title}</td>
                <td><button class="btn btn-primary btn-sm"
                        onclick="treeController.restoreFromTreeHistory(${elem.step}, true)"
                    >View</button></td>
            </tr>`
        })
        return str;
    }
    /**
     * Add new history record
     * @param {string} title Title of the transaction
     * @param {string} func One of the following: 'reset', 'insert', 'delete'
     * @param {number} argument Operation argument. Either value (insert/delete) or max elements (reset)
     */
    push(title, func, argument) {
        this.history.push({ step: this.history.length, title, func, argument })
    }
    /** Resets the history */
    reset() {
        this.history = []
    }
    /**
     * Restores a tree from the history
     * @param {number} index Index of the step which should be loaded
     * @returns Tree object of the loaded steps
     */
    restoreFromTreeHistory(index) {
        if (index == undefined || !Number.isInteger(index) || index >= this.history.length) {
            throw new Error("Invalid index")
        }
        let tree;
        for (let i = 0; i <= index; i++) {
            let elem = this.history[i]
            switch (elem.func) {
                case 'reset':
                    tree = new Tree(elem.argument)
                    break;
                case 'insert':
                    tree.insert(elem.argument)
                    break;
                case 'delete':
                    tree.delete(elem.argument)
                    break;
            }
        }
        return tree;
    }
    /** Number of history's records */
    get length() {
        return this.history.length
    }
} // end TreeHistory

/** Controller for page's tree */
class TreeController {
    /**
     * Create controller instance
     * @param {Tree} tree Optional initial tree (default: empty tree with k = 2)
     */
    constructor(tree) {
        this.tree = tree || new Tree(2)
        this.treeHistory = new TreeHistory()
    }
    /**
     * Draws tree graph and the history
     * @param {boolean} printHistory If true, history is printed
     */
    drawTree(printHistory) {
        const graph = this.tree.toViz()
        const viz = document.getElementById('viz')
        viz.innerHTML = Viz(graph, 'svg')
        const svg = viz.querySelector('svg')
        const shallScaleWidth = document.getElementById('scale_width_cbx').checked
        if (shallScaleWidth) {
            svg.setAttribute('width', '100%')
        }
        if (printHistory) { this.printTreeHistory() }
    }
    /**
     * Resets the tree with max elements as set in input element
     * @param {boolean} drawTree If true, tree and hostory are printed
     */
    resetTree(drawTree) {
        const min = document.getElementById("min_elements").value
        this.tree.reset()
        this.treeHistory.reset()
        this.treeHistory.push(`Reset with k = ${min}`, 'reset', min)
        if (drawTree) { this.drawTree(true) }
    }
    /**
     * Inserts an element into the tree
     * @param {number} arg Value to be inserted
     * @param {boolean} drawTree If true, tree and history are printed
     */
    insert(arg, drawTree) {
        this.restoreFromTreeHistory(this.treeHistory.length - 1)
        this.tree.insert(arg)
        this.treeHistory.push(`Insert ${arg}`, 'insert', arg)
        if (drawTree) { this.drawTree(true) }
    }
    /**
     * Deletes an element into the tree
     * @param {number} arg Value to be deleted
     * @param {boolean} drawTree If true, tree and history are printed
     */
    delete(arg, drawTree) {
        this.restoreFromTreeHistory(this.treeHistory.length - 1)
        this.tree.delete(arg)
        this.treeHistory.push(`Delete ${arg}`, 'delete', arg)
        if (drawTree) { this.drawTree(true) }
    }
    /**
     * Prints the tree history
     */
    printTreeHistory() {
        document.getElementById('tree_hist').innerHTML = this.treeHistory.toHtml()
    }
    /**
     * Loads a previous tree from the history
     * @param {number} index Index of the step which should be loaded
     * @param {boolean} drawTree If true, tree is drawn
     */
    restoreFromTreeHistory(index, drawTree) {
        this.tree = this.treeHistory.restoreFromTreeHistory(index)
        if (drawTree) { this.drawTree(false) } // history does not change
    }
    /**
     * Pops a toast lasting for 2 seconds
     * @param {string} title Toast's title
     * @param {string} text Toast's content
     * @param {string} cssClass Choose 'toastSuccess' for green or 'toastFail' for red (optional)
     */
    showToast(title, text, cssClass) {
        const id = `toast_${Math.floor(Math.random() * 10 ^ 6)}`
        const toast = `<div id="${id}" data-delay="2000" class="toast ${cssClass ? cssClass : ""}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header panel-header panel-success">
                <strong class="mr-auto">${title}</strong>
            </div>
            <div class="toast-body">
                ${text}
            </div>
        </div>`

        const old = document.getElementById('toast_container').innerHTML
        document.getElementById('toast_container').innerHTML = toast + old
        $(`#${id}`).toast('show')
        setTimeout(() => {
            document.getElementById(id).remove()
        }, 2200)
    }
    /**
     * Opens a generic modal with given contents
     * @param {string} title Modal title
     * @param {string} text Modal content (HTML)
     */
    showModal(title, text) {
        const modal = document.getElementById('modal')
        modal.querySelector('.modal-title').innerHTML = title
        modal.querySelector('.modal-body').innerHTML = text
        $('#modal').modal('show')
    }
    /** Handles execution of csv import */
    csvImportHandler() {
        let values = document.getElementById('showCsvValues').innerHTML.split(", ")
        values.forEach(val => {
            try {
                treeController.insert(+val)
            } catch (e) {
                treeController.showToast('Insert failed', e.getMessage ? e.getMessage() : e, 'toastFail')
            }
        })
        treeController.showToast('CSV Import', 'Importing from CSV finished', 'toastSuccess')
        treeController.drawTree(true)
        $('#modal').modal('hide')
    }
} // end TreeController

var treeController; // make accessible to history onclicks
document.addEventListener("DOMContentLoaded", () => {
    // initialization of variables
    treeController = new TreeController()
    treeController.resetTree()
    treeController.printTreeHistory()

    // add listeners
    document.getElementById('reset').addEventListener('click', () => {
        treeController.resetTree(true)
        treeController.showToast('Tree Reset', `Tree was resetted with max elements of ${treeController.tree.maxElements}`, 'toastSuccess')
    })
    document.getElementById('insert_btn').addEventListener('click', () => {
        const val = document.getElementById("op_val").value
        document.getElementById("op_val").value = ''
        val.split(",").forEach(op => {
            try {
                if (op && Number.isInteger(+op)) {
                    treeController.insert(+op)
                } else if (op) {
                    throw new Error("Invalid insert value: " + op)
                }
            } catch (e) {
                treeController.showToast('Insert failed', e.getMessage ? e.getMessage() : e, 'toastFail')
            }
        })
        treeController.drawTree(true)

    })
    document.getElementById('delete_btn').addEventListener('click', () => {
        const val = document.getElementById("op_val").value
        document.getElementById("op_val").value = ''
        val.split(",").forEach(op => {
            try {
                if (op && Number.isInteger(+op)) {
                    treeController.delete(+op)
                } else if (op) {
                    throw new Error("Invalid delete value: " + op)
                }
            } catch (e) {
                treeController.showToast('Insert failed', e.getMessage ? e.getMessage() : e, 'toastFail')
            }
        })
        treeController.drawTree(true)

    })
    document.getElementById('search_btn').addEventListener('click', () => {
        const val = document.getElementById("search_val").value
        if (!val) { return; }
        const searchResult = treeController.tree.search(+val)
        let content = `
            <p>Search value: ${val}</p>
            <p>Found: ${searchResult.found || false}</p>`
        if (searchResult.found) {
            content += `<p>In node: [${searchResult.node.values.join(", ")}]</p>`
        }
        content += `<p>Steps: ${searchResult.pageCount}</p>`
        treeController.showModal('Search Result', content)

    })
    document.getElementById('rand_btn').addEventListener('click', () => {
        const min = +document.getElementById("rand_min").value
        const max = +document.getElementById("rand_max").value
        const cnt = +document.getElementById("rand_cnt").value
        if (Number.isInteger(min) && Number.isInteger(max) && Number.isInteger(cnt)) {
            for (let i = 0; i < cnt; i++) {
                try {
                    const rand = Math.floor(Math.random() * (max - min)) + min + 1
                    treeController.insert(rand)
                } catch (e) {
                    treeController.showToast('Insert failed', e.getMessage ? e.getMessage() : e, 'toastFail')
                }
            }
        }
        treeController.showToast('Insert Random', 'Inserting random numbers finished', 'toastSuccess')
        treeController.drawTree(true)
    })
    document.getElementById('scale_width_cbx').addEventListener('change', () => { treeController.drawTree() })
    document.getElementById('csv_btn').addEventListener('click', () => {
        const file = document.getElementById("csv_file").files[0]
        if (!file) { return; }

        const regex = /[^[\d,\\n]/g

        const reader = new FileReader();
        reader.readAsText(file)

        reader.onload = (event) => {
            const txt = event.target.result
            const values = [];

            let rows;
            let cols;
            rows = txt.split('\n')
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i].replace(regex, '')
                cols = row.split(',')
                let num = +cols[0]
                if (!Number.isInteger(num)) { continue; }
                values.push(num)
            }

            treeController.showModal('CSV Import', `
                <div>
                    <span id="showCsvValues">${values.join(", ")}</span>
                    <button class="btn btn-primary" onclick="treeController.csvImportHandler()">EXECUTE!!!!!</button>
                </div>
            `)
        }
    })
})
