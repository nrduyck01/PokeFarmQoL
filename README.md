# PokeFarmQoL
Userscript that includes a few QoL changes to Pokéfarm and can enhance your Pokéfarm experience even more!

# Features
- Pokémon evolve list in the farm sorted on types.
- Advanced Shelter Search with custom search parameters.
- Select all Pokémon on field mass release, mass move & fishing.
- Advanced Fields sorting & Pokémons clicked counter in fields
- Mass party clicking modifications
- Highlight eligible breeding partners for a pokemon while searching from the daycare

# Open Issues
- ~~ISSUE 1 - **Multiuser Page** - Party Mods don't work~~
- ~~ISSUE 2 - **Farm Page** - Sorting by new dex entry doesn't work~~
- ~~ISSUE 3 - **Public Fields** - Searching other player's fields doesn't work~~
- ~~ISSUE 4 - **Public/Private Field** - When reloading page with no types, the page will reload with 15 empty type boxes~~
- ~~ISSUE 5 - **Shelter** - Delta Pokemon are not highlighted~~
- ~~ISSUE 6 - **Public/Private Fields** - Nicknamed pokemon are not highlighted correctly~~
- ~~ISSUE 7 - **All** - Script not working, but old script is working. Multiple users affected~~
- ISSUE 9 - **All** - Script randomly stops working (May be related to TM Issue 477)

# Open Suggestions
- ~~**Public/Private Field** - Move "sort by" toggles above search fields~~
- **Private Field** - Highlight Pokemon based on how fully evolved they are
- **All** - Add "at a glance" party reminder in the timers bar
- **Pokedex** - Search for dual type pokemon
- **Public/Private Field** - Emulate advanced search features from shelter
- **Public/Private Field** - Make the automatic tooltip function toggable
- **Public Field** - Grey out fully clicked fields - https://pokefarm.com/forum/post/5235358

# In Progress
- **Shelter** - Highlight pokemon that are ready to evolve (not by item)
- ISSUE 8 - **Public/Private Fields** - parseFieldTooltip does not properly handle cases were the tooltip contains different information

# Past Suggestions/Issues
- **Farm Page** - Easy Evolution doesn't work when the list is sorted - This was not fixed, because it is impossible to implement given the current design of the sorted lists without copying code from pokefarm.
- **Shelter** - Add nature/berry selector - This feature was not implemented, because it would 1) cause the shelter page to be extremely slow, 2) requires additional information not readily available on the shelter page, and 3) (may) break the one-click rule.
- **Shelter** - Highlight pokemon that are ready to evolve (by item) - This feature was not implemented, because it would require loading information from a user's inventory
