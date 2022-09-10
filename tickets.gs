#include "includes\multiplayer_core.inc"

global scps = [9,SE_INT]
global cd = [2,SE_INT]
global found = [5,SE_INT]
//tickets

//SCPs (Excluding 049-2 cause its "special")
scps[1] = 5
scps[2] = 6
scps[3] = 10
scps[4] = 11
scps[5] = 12
scps[7] = 14
scps[0] = 15
scps[6] = 16 

//Class D Team
cd[1] = 3
cd[0] = 7

//Security
found[0] = 2
found[1] = 1
found[2] = 8
found[3] = 9
found[4] = 4

global playertypes = [127,SE_INT]
global mtfticks = 5
global chaosticks = 5

public def OnScriptLoaded()
    for x = 0; x < 128; x = x + 2 //For every second slot in the list, add possible player number, should support 64 players
        playertypes[x] = x/2 + 1 //Mathmatic genius
    end
end

def roles(plr, role)
    plr = 2*plr - 1
    playertypes[plr] = role
    print(playertypes[plr])
end

public def OnPlayerGetNewRole(plr, _, role)
    CreateTimer("roles", 5000, 0, plr, role) //make sure it runs after kill detect system
end

public def SpawnMTF()
    print("lego")
    local specs = [62,SE_INT] //Minus 2 plrs from max players as u need atleast 2 players for a round not to end
    local speccounter = 0
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) == 1 then
            if GetPlayerType(plr) == 0 then
                for space; space < 64; space++
                    if specs[space] == 0 then
                        specs[space] = plr
                        speccounter++
                        break
                    end
                end
            end
        end
    end
    print(speccounter)
    while mtfticks > 0 or speccounter > 0 or giveup < 63; giveup++
        index = rand(1,62)
        plr = specs[index]
        if IsPlayerConnected(plr) == 1 then
            SetPlayerType(plr,1)
            specs[index] = 0
            mtfticks = mtfticks - 1
            speccounter = speccounter - 1
        end
    end
end

def breakpast()
    SetChaosTickets(0)
    SetMTFTickets(0)
end
public def OnRoundStarted()
    CreateTimer("breakpast",2000,0) //Good luck using the old spawn system without tickets
end

public def OnPlayerKillPlayer(shooter,shootee)
    pass //life is mean
end

public def OnPlayerEscape(plr, _, escaped)
    if escaped == 7 then
        chaosticks = chaosticks + 2
    end
    if escaped == 1 then
        mtfticks = mtfticks + 2
    end
end