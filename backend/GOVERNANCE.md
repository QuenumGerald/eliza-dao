# Documentation de la Gouvernance Eliza DAO

## Paramètres de Gouvernance

### Paramètres Actuels
- **Période de Vote** : 45818 blocs (~1 semaine)
- **Délai de Vote** : 1 bloc
- **Seuil de Proposition** : 1 token
- **Quorum** : 4% des tokens

### Modifications Possibles
Les paramètres suivants peuvent être modifiés via des propositions de gouvernance :

1. **Période de Vote** (`setVotingPeriod`)
   - Peut être modifié via une proposition
   - Exemple : `governor.setVotingPeriod(300)` pour 5 minutes

2. **Délai de Vote** (`setVotingDelay`)
   - Peut être modifié via une proposition
   - Exemple : `governor.setVotingDelay(1)` pour 1 bloc

3. **Seuil de Proposition** (`setProposalThreshold`)
   - Peut être modifié via une proposition
   - Exemple : `governor.setProposalThreshold(1)` pour 1 token

4. **Quorum**
   - Ne peut PAS être modifié après le déploiement
   - Fixé à 4% dans le constructeur
   - Nécessite un redéploiement pour modification

## Scripts Disponibles

### 1. Création de Proposition de Transfert
```javascript
// scripts/propose-token-transfer.js
// Permet de créer une proposition pour transférer des tokens
npx hardhat run scripts/propose-token-transfer.js --network arbitrum
```

### 2. Mise à jour des Paramètres de Gouvernance
```javascript
// scripts/update-governor-settings.js
// Permet de modifier la période de vote, le délai et le seuil
npx hardhat run scripts/update-governor-settings.js --network arbitrum
```

## Processus de Proposition

1. **Création**
   - Via `proposeByEliza` pour le bot
   - Via `propose` pour les détenteurs de tokens

2. **Vote**
   - Période d'attente : 1 bloc
   - Période de vote : 45818 blocs (~1 semaine)
   - Quorum requis : 4% des tokens
   - Majorité simple pour l'adoption

3. **Exécution**
   - Après la période de vote
   - Si le quorum est atteint
   - Si la majorité est en faveur

## Adresses des Contrats
```javascript
// deployed-addresses.json
{
    "governor": "ADRESSE_DU_GOVERNOR",
    "token": "ADRESSE_DU_TOKEN",
    "timelock": "ADRESSE_DU_TIMELOCK"
}
```

## Notes Importantes
1. Les modifications des paramètres de gouvernance nécessitent une proposition et un vote
2. Le quorum est fixe et nécessite un redéploiement pour être modifié
3. Seuls les détenteurs de tokens peuvent voter
4. Le rôle ELIZA_ROLE peut créer des propositions via `proposeByEliza`
