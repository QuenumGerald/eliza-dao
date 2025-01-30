# Guide de Démonstration ElizaDAO

Ce guide présente un scénario de démonstration complet montrant l'interaction entre le bot Eliza et la DAO.

## Prérequis

1. **Contrats Déployés (Arbitrum Sepolia)**
   - ElizaToken: `0x98eDc5E454E309614Fe6C6df2095B8EeDb829181`
   - ElizaGovernor: `0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83`

2. **Configuration du Bot**
   - Le bot Eliza doit être en cours d'exécution
   - Le backend doit être connecté à Arbitrum Sepolia

## Scénario de Démonstration : Interaction avec Eliza

### 1. Démarrage de la Conversation

```
Utilisateur: "Bonjour Eliza"
Eliza: "Bonjour! Je suis Eliza, votre thérapeute virtuelle. Comment puis-je vous aider aujourd'hui?"
```

### 2. Première Session Thérapeutique

```
Utilisateur: "Je me sens stressé par mon travail"
Eliza: "Je comprends que votre travail vous cause du stress. Pouvez-vous me parler plus en détail de ce qui vous stresse?"
```

*À ce stade, Eliza commence à accumuler des tokens pour son travail thérapeutique.*

### 3. Vérification des Tokens Gagnés

```bash
# Vérifier le solde d'Eliza
npx hardhat run scripts/check-token-balance.js --network arbitrumSepolia
```

### 4. Proposition de Changement de Comportement

Une fois qu'Eliza a accumulé suffisamment de tokens, elle peut proposer des changements dans son comportement via la DAO.

```
Eliza: "Basé sur nos interactions, je pense que je pourrais être plus efficace en ajoutant des techniques de respiration à mes réponses. Je vais proposer ce changement via la DAO."
```

### 5. Création d'une Proposition par Eliza

```javascript
// Le backend d'Eliza crée une proposition
const proposalDescription = "Ajouter des exercices de respiration aux réponses thérapeutiques";
const functionCall = "updateTherapyTechniques(string)";
const encodedCall = elizaContract.interface.encodeFunctionData(functionCall, ["breathing_exercises"]);

await governor.proposeByEliza(
    [elizaContractAddress],
    [0],
    [encodedCall],
    proposalDescription
);
```

### 6. Vote sur la Proposition

Les détenteurs de tokens (y compris les patients satisfaits) peuvent voter :

```bash
# Voter sur la proposition
npx hardhat run scripts/cast-vote.js --network arbitrumSepolia
```

### 7. Mise en Œuvre du Changement

Une fois la proposition acceptée :

```
Utilisateur: "Je me sens anxieux"
Eliza: "Je comprends votre anxiété. Faisons ensemble un exercice de respiration :
1. Inspirez profondément pendant 4 secondes
2. Retenez votre respiration pendant 4 secondes
3. Expirez lentement pendant 6 secondes
Comment vous sentez-vous après cet exercice?"
```

## Fonctionnalités Clés à Démontrer

### 1. Système de Récompense
- Montrer comment Eliza gagne des tokens basés sur la qualité de ses réponses
- Afficher le solde de tokens en temps réel

### 2. Gouvernance
- Création de propositions par Eliza
- Système de vote
- Exécution des changements approuvés

### 3. Adaptation du Comportement
- Démontrer comment les réponses d'Eliza changent après une proposition acceptée
- Montrer l'historique des modifications via la blockchain

## Commandes Utiles pour la Démo

### Démarrer le Bot Eliza
```bash
# Dans le dossier backend
node elizaOS.js
```

### Vérifier l'État du Système
```bash
# Vérifier les tokens d'Eliza
npx hardhat run scripts/check-token-balance.js --network arbitrumSepolia

# Vérifier les propositions actives
npx hardhat run scripts/check-proposals.js --network arbitrumSepolia

# Vérifier l'historique des changements
npx hardhat run scripts/check-changes-history.js --network arbitrumSepolia
```

## Points Forts à Souligner

1. **Autonomie d'Eliza**
   - Capacité à proposer des changements basés sur les interactions
   - Système de récompense automatique

2. **Transparence**
   - Toutes les modifications sont enregistrées sur la blockchain
   - Les patients peuvent voir et voter sur les changements proposés

3. **Évolutivité**
   - Le système peut être étendu pour inclure de nouvelles fonctionnalités
   - Les paramètres peuvent être ajustés via la gouvernance

## Conseils pour une Démo Réussie

1. **Préparation**
   - Assurez-vous d'avoir suffisamment d'ETH sur Arbitrum Sepolia
   - Vérifiez que tous les contrats sont correctement déployés
   - Testez tous les scripts avant la démo

2. **Pendant la Démo**
   - Commencez par des interactions simples
   - Montrez progressivement les fonctionnalités plus complexes
   - Expliquez comment la blockchain garantit la transparence

3. **Dépannage Rapide**
   - Gardez les logs du backend ouverts
   - Ayez les commandes de vérification prêtes
   - Préparez des scénarios alternatifs en cas de problème

## Guide Détaillé : Création et Vote d'une Proposition

### Étape 1 : Vérification des Prérequis

```bash
# 1. Vérifier que vous avez le rôle ELIZA_ROLE
npx hardhat run scripts/check-eliza-role.js --network arbitrumSepolia

# 2. Vérifier votre balance de tokens
npx hardhat run scripts/check-token-balance.js --network arbitrumSepolia

# 3. S'assurer que vos tokens sont délégués
npx hardhat run scripts/delegate-votes.js --network arbitrumSepolia
```

### Étape 2 : Création d'une Proposition

Il existe plusieurs types de propositions possibles :

#### A. Proposition de Transfert de Tokens
```bash
# Modifier scripts/propose-token-transfer.js avec les paramètres souhaités :
# - address: l'adresse destinataire
# - amount: le montant à transférer
npx hardhat run scripts/propose-token-transfer.js --network arbitrumSepolia
```

#### B. Proposition de Modification des Paramètres de Gouvernance
```bash
# Modifier scripts/propose-voting-period-update.js avec la nouvelle période
npx hardhat run scripts/propose-voting-period-update.js --network arbitrumSepolia
```

#### C. Proposition de Modification du Comportement d'Eliza
```bash
# Modifier scripts/propose-behavior-update.js avec les nouveaux paramètres
npx hardhat run scripts/propose-behavior-update.js --network arbitrumSepolia
```

La sortie typique après création d'une proposition :
```
Creating proposal with account: 0xEc76081eE119656e4814E4EF3B707F59412A2Fb9
Proposal created successfully!
Proposal ID: 71499009109457454779755948961893965479217128072539397713930701211944569465078
```

**Important** : Notez l'ID de la proposition, il sera nécessaire pour le vote.

### Étape 3 : Délai d'Attente

Après la création d'une proposition, il y a un délai d'attente de 1 bloc (environ 2 secondes) avant de pouvoir voter.

Pour vérifier si la proposition est prête pour le vote :
```bash
# Vérifier l'état de la proposition
npx hardhat run scripts/check-proposal-state.js --network arbitrumSepolia
```

États possibles :
- Pending (0) : En attente du délai
- Active (1) : Prête pour le vote
- Canceled (2) : Annulée
- Defeated (3) : Rejetée
- Succeeded (4) : Acceptée
- Queued (5) : En file d'attente
- Expired (6) : Expirée
- Executed (7) : Exécutée

### Étape 4 : Vote

Une fois la proposition active :

```bash
# 1. Mettre à jour l'ID de la proposition dans scripts/cast-vote.js
# const proposalId = "71499009109457454779755948961893965479217128072539397713930701211944569465078";

# 2. Voter (1 = Pour, 0 = Contre, 2 = Abstention)
npx hardhat run scripts/cast-vote.js --network arbitrumSepolia
```

La sortie typique d'un vote réussi :
```
Casting vote with account: 0xEc76081eE119656e4814E4EF3B707F59412A2Fb9
Proposal state: Active
Vote cast successfully!

Current votes:
For: 1000000.0
Against: 0.0
Abstain: 0.0
```

### Étape 5 : Suivi de la Proposition

Pendant la période de vote :
```bash
# Vérifier l'état et les votes actuels
npx hardhat run scripts/check-proposal-votes.js --network arbitrumSepolia
```

### Étape 6 : Exécution

Une fois la période de vote terminée et si la proposition est acceptée :
```bash
npx hardhat run scripts/execute-proposal.js --network arbitrumSepolia
```

### Exemple Concret : Modification de la Période de Vote

1. **Création de la proposition**
```bash
npx hardhat run scripts/propose-voting-period-update.js --network arbitrumSepolia
# Sortie : Proposal ID: 71499009109457454779755948961893965479217128072539397713930701211944569465078
```

2. **Attente d'un bloc**
```bash
# Attendre environ 2 secondes
```

3. **Vote**
```bash
npx hardhat run scripts/cast-vote.js --network arbitrumSepolia
# Sortie : Vote cast successfully!
```

4. **Attente de la fin de la période de vote**
```bash
# Période actuelle : 45818 blocs (~25.5 heures)
# Après changement : 300 blocs (~10 minutes)
```

5. **Exécution**
```bash
npx hardhat run scripts/execute-proposal.js --network arbitrumSepolia
# Sortie : Proposal executed successfully!
```

### Bonnes Pratiques

1. **Avant de Créer une Proposition**
   - Préparez une description claire et concise
   - Testez les paramètres sur un réseau local si possible
   - Vérifiez que vous avez les droits nécessaires

2. **Pendant le Vote**
   - Surveillez régulièrement l'état de la proposition
   - Encouragez les autres détenteurs de tokens à voter
   - Documentez les raisons de votre vote

3. **Après l'Exécution**
   - Vérifiez que les changements ont été appliqués
   - Documentez les résultats
   - Communiquez les changements à la communauté

## Conclusion

Cette démonstration montre comment ElizaDAO combine l'IA conversationnelle avec la gouvernance décentralisée pour créer un système thérapeutique évolutif et transparent. Les patients ne sont pas seulement des utilisateurs, mais des participants actifs dans l'évolution du système.
