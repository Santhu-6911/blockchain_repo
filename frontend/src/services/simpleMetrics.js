class SimpleMetrics {
  constructor() {
    this.data = {
      traditional: {
        registrationTime: 0,
        loginTime: 0,
        dashboardLoadTime: 0,
        totalErrors: 0,
        completed: false
      },
      blockchain: {
        registrationTime: 0,
        loginTime: 0,
        walletConnectionTime: 0,
        transactionTime: 0,
        dashboardLoadTime: 0,
        totalErrors: 0,
        completed: false
      }
    };
    
    this.timers = {};
    this.loadData();
  }

  loadData() {
    const saved = localStorage.getItem('researchMetrics');
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        console.log('Could not load saved data');
      }
    }
  }

  saveData() {
    localStorage.setItem('researchMetrics', JSON.stringify(this.data));
  }

  startTimer(action) {
    this.timers[action] = Date.now();
    console.log('Started timing: ' + action);
  }

  stopTimer(action, system) {
    if (!this.timers[action]) {
      console.log('Timer not found: ' + action);
      return 0;
    }

    const timeSpent = Date.now() - this.timers[action];
    delete this.timers[action];

    if (action === 'registration') {
      this.data[system].registrationTime = timeSpent;
    } else if (action === 'login') {
      this.data[system].loginTime = timeSpent;
    } else if (action === 'walletConnection') {
      this.data[system].walletConnectionTime = timeSpent;
    } else if (action === 'transaction') {
      this.data[system].transactionTime = timeSpent;
    } else if (action === 'dashboardLoad') {
      this.data[system].dashboardLoadTime = timeSpent;
    }

    this.saveData();
    console.log(system + ' ' + action + ': ' + timeSpent + 'ms');
    return timeSpent;
  }

  addError(system, errorType) {
    this.data[system].totalErrors++;
    this.saveData();
    console.log('Error in ' + system + ': ' + errorType + '. Total: ' + this.data[system].totalErrors);
  }

  markCompleted(system) {
    this.data[system].completed = true;
    this.saveData();
    console.log(system + ' system completed successfully');
  }

  getData() {
    return this.data;
  }

  getComparison() {
    const trad = this.data.traditional;
    const blockchain = this.data.blockchain;
    
    const tradTotal = trad.registrationTime + trad.loginTime;
    const blockchainTotal = blockchain.registrationTime + blockchain.loginTime + blockchain.walletConnectionTime;
    
    return {
      traditional: {
        registrationTime: trad.registrationTime,
        loginTime: trad.loginTime,
        dashboardLoadTime: trad.dashboardLoadTime,
        totalTime: tradTotal,
        errors: trad.totalErrors,
        completed: trad.completed
      },
      blockchain: {
        registrationTime: blockchain.registrationTime,
        loginTime: blockchain.loginTime,
        walletConnectionTime: blockchain.walletConnectionTime,
        transactionTime: blockchain.transactionTime,
        dashboardLoadTime: blockchain.dashboardLoadTime,
        totalTime: blockchainTotal,
        errors: blockchain.totalErrors,
        completed: blockchain.completed
      },
      winners: {
        fasterRegistration: trad.registrationTime < blockchain.registrationTime ? 'Traditional' : 'Blockchain',
        fasterLogin: trad.loginTime < blockchain.loginTime ? 'Traditional' : 'Blockchain',
        fewerErrors: trad.totalErrors < blockchain.totalErrors ? 'Traditional' : 'Blockchain',
        fasterOverall: tradTotal < blockchainTotal ? 'Traditional' : 'Blockchain'
      },
      differences: {
        registrationDiff: Math.abs(trad.registrationTime - blockchain.registrationTime),
        loginDiff: Math.abs(trad.loginTime - blockchain.loginTime),
        totalDiff: Math.abs(tradTotal - blockchainTotal)
      }
    };
  }

  showResults() {
    const comp = this.getComparison();
    console.log('RESEARCH RESULTS');
    console.log('Traditional registration time: ' + comp.traditional.registrationTime + 'ms');
    console.log('Blockchain registration time: ' + comp.blockchain.registrationTime + 'ms');
    console.log('Traditional login time: ' + comp.traditional.loginTime + 'ms');
    console.log('Blockchain login time: ' + comp.blockchain.loginTime + 'ms');
    console.log('Traditional total time: ' + comp.traditional.totalTime + 'ms');
    console.log('Blockchain total time: ' + comp.blockchain.totalTime + 'ms');
    console.log('Traditional errors: ' + comp.traditional.errors);
    console.log('Blockchain errors: ' + comp.blockchain.errors);
    console.log('Faster registration: ' + comp.winners.fasterRegistration);
    console.log('Faster login: ' + comp.winners.fasterLogin);
    console.log('Fewer errors: ' + comp.winners.fewerErrors);
    console.log('Faster overall: ' + comp.winners.fasterOverall);
    return comp;
  }

  downloadResults() {
    const results = {
      data: this.data,
      comparison: this.getComparison(),
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research_metrics.json';
    link.click();
    
    window.URL.revokeObjectURL(url);
    console.log('Research data downloaded');
  }

  reset() {
    localStorage.removeItem('researchMetrics');
    this.data = {
      traditional: { registrationTime: 0, loginTime: 0, dashboardLoadTime: 0, totalErrors: 0, completed: false },
      blockchain: { registrationTime: 0, loginTime: 0, walletConnectionTime: 0, transactionTime: 0, dashboardLoadTime: 0, totalErrors: 0, completed: false }
    };
    console.log('Research data reset');
  }
}

const metrics = new SimpleMetrics();

export default metrics;