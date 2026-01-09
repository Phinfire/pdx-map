# Backend Service Repositories
- [Authentication](https://github.com/phinfire/authenticationService)
- [MegaCampaign-Signup and Administration](https://github.com/phinfire/MC-Signup-Backend)
- [Interacting with Discord](https://github.com/phinfire/miniDiscordGateway)
- [CRUD Database + Proxying the Skanderbeg API](https://github.com/phinfire/skanderbegGateway)

# Saves and associated data handling
When uploading a save file (not just opening it using the analyzer), the SaveSaverService will also create and upload reduced views of the save file for faster and less bandwidth-intensive access by other parts of the application. E.g. the "demography" data for Vic3 saves to be used by the alliance helper

# Implementation
## Parsing CK3 Save Files
    - Character
    - LandedTitle
    - Holding
    - Culture
    - Faith

## CK3 - Country Ownership
-

## VIC3 - SAVE MODEL
    - Save contains Countries
    - Countries contain States
    - States contain Buildings