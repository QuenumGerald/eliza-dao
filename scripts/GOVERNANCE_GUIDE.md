# Guide de Gouvernance ElizaDAO

Ce document explique en détail le fonctionnement de la gouvernance d'ElizaDAO et comment utiliser les différents scripts.

## Contrats Déployés (Arbitrum Sepolia)

- ElizaToken: `0x98eDc5E454E309614Fe6C6df2095B8EeDb829181`
- ElizaGovernor: `0xC0D4835806942cDfEcBb01173b6eE9f52a48EB83`

## Paramètres de Gouvernance

### Paramètres Actuels
- Délai de vote (votingDelay): 1 bloc (~2 secondes)
- Période de vote (votingPeriod): 45818 blocs (~25.5 heures)
- Seuil de proposition (proposalThreshold): 1 token
- Quorum: 4% des tokens

### Modification en Cours
Une proposition est en cours pour modifier la période de vote :
- ID: 71499009109457454779755948961893965479217128072539397713930701211944569465078
- Objectif: Réduire la période de vote à 300 blocs (~10 minutes)
- État: En cours de vote
- Date d'expiration prévue: ~25.5 heures après la création (30 janvier 2025)

## Scripts Disponibles

### 1. Création de Proposition
```bash
npx hardhat run scripts/propose-voting-period-update.js --network arbitrumSepolia
```
Ce script crée une proposition pour modifier un paramètre de gouvernance. Il nécessite le rôle ELIZA_ROLE.

### 2. Vote
```bash
npx hardhat run scripts/cast-vote.js --network arbitrumSepolia
```
Permet de voter sur une proposition active. Options de vote :
- 0: Contre
- 1: Pour
- 2: Abstention

### 3. Exécution
```bash
npx hardhat run scripts/execute-proposal.js --network arbitrumSepolia
```
Exécute une proposition une fois qu'elle a été acceptée.

## Processus de Gouvernance

1. **Création d'une Proposition**
   - Nécessite le rôle ELIZA_ROLE
   - Délai de vote d'1 bloc avant de pouvoir voter

2. **Phase de Vote**
   - Durée actuelle: 45818 blocs (~25.5 heures)
   - Quorum requis: 4% des tokens
   - Les votants doivent avoir délégué leurs tokens avant la création de la proposition

3. **Exécution**
   - Une fois la proposition acceptée, n'importe qui peut l'exécuter
   - La proposition doit avoir atteint le quorum
   - La proposition doit avoir plus de votes "Pour" que "Contre"

## Vérification de l'État d'une Proposition

Les états possibles sont :
0. Pending: En attente (pendant le délai de vote)
1. Active: Vote en cours
2. Canceled: Annulée
3. Defeated: Rejetée
4. Succeeded: Acceptée
5. Queued: En file d'attente
6. Expired: Expirée
7. Executed: Exécutée

## Bonnes Pratiques

1. **Avant de Créer une Proposition**
   - Vérifier que vous avez le rôle ELIZA_ROLE
   - S'assurer que les tokens sont bien délégués

2. **Avant de Voter**
   - Attendre que la proposition soit active (après le délai de vote)
   - Vérifier que vous avez délégué vos tokens

3. **Avant d'Exécuter**
   - Attendre la fin de la période de vote
   - Vérifier que la proposition a été acceptée
   - Vérifier que le quorum a été atteint

## Commandes Utiles

### Vérifier son Pouvoir de Vote
```bash
npx hardhat run scripts/check-token-balance.js --network arbitrumSepolia
```

### Déléguer ses Tokens
```bash
npx hardhat run scripts/delegate-votes.js --network arbitrumSepolia
```

### Vérifier les Rôles
```bash
npx hardhat run scripts/check-eliza-role.js --network arbitrumSepolia
```
