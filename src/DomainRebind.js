const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

class DomainRebind {

    constructor(domain) {
        this.domain = domain
        this.program = this.parseProgram(this.domain)
        this.programCounter = 0
        this.valid = this.program.length > 0
        this.type = null // 'A' or 'CNAME'
    }

    // run the program and return an IP address, or null
    next() {

        if (this.programCounter == this.program.length) return null
        
        const instruction = this.program[this.programCounter]

        if (instruction.name == 'repeat') { // repeat
            this.programCounter = 0
            this.program = this.parseProgram(this.domain)
            return this.next()
        } else { // times and forever
            instruction.count--
            if (instruction.count == 0) {
                this.programCounter++
            }
        }

        return instruction.ip
    }

    // ntimes
    // forever
    // repeat
    parseProgram(domain) {

        const labels = domain.toLowerCase().split('.')
        const instructions = []

        if (labels.length < 1) return []

        // if this isn't an A or CNAME request
        if (!['A', 'CNAME'].includes(labels[0].toUpperCase())) {
            return []
        }

        // loop through the labels and create instructions
        for (let i = 1; i < labels.length; i++) {
            
            // see if the next four labels make and ip address
            const ip = [labels[i], labels[i+1], labels[i+2], labels[i+3]].join('.')

            if (ipRegex.test(ip)) {
                
                const rule = labels[i + 4]

                if (/^\d+time[s]*$/.test(rule)) {
                    
                    instructions.push({ 
                        name: 'times', 
                        ip, 
                        count: parseInt(rule.match(/^\d+/)[0])
                    })

                } else if (rule == 'forever') {

                    instructions.push({ 
                        name: 'forever', 
                        ip, 
                        count: Infinity
                    })

                } else if (rule == 'repeat') {

                     instructions.push({ name: 'repeat' })   
                }

                i += 4

            } else {
                if (labels[i] == 'repeat') {
                    instructions.push({ name: 'repeat' })
                }
            }
        }
        return instructions
    }
}

module.exports = DomainRebind