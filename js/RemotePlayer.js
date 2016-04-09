RemotePlayer = function (index, game, player, money, betMoney) {
  this.game = game
  this.player = player
  this.alive = true

  this.player.name = index.toString()

  this.lastBetValue = betMoney
  this.previousMoney = money
}

RemotePlayer.prototype.update = function () {
 if (this.betMoney !== this.lastBetValue) {
  this.betMoney = this.lastBetValue
  this.lastBetValue = this.betMoney
  }

  if (this.money !== this.previousMoney) {
   this.money = this.previousMoney
   this.previousMoney = this.money
  }
}

window.RemotePlayer = RemotePlayer
