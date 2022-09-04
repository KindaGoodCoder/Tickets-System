#include "includes\multiplayer_core.inc"

//tickets
scps[1] = 5
scps[2] = 6
scps[3] = 10
scps[4] = 11
scps[5] = 12
scps[6] = 13
scps[7] = 14
scps[8] = 15
scps[0] = 16 //forgot it started at 0

//Class D Team
cd[1] = 3
cd[0] = 7
//Security
found[0] = 2
found[1] = 1
found[2] = 8
found[3] = 9
found[4] = 4

playertypes = [128,SE_INT]
global mtfticks, chaosticks

def loop()
    for plr = 1; plr < 64; plr++
        if IsPlayerConnected(plr) == 1 then
            for y = 0; y < 128; y = y + 2
                if playertypes[y] == 0 then
                    playertypes[y] = plr
                    playertypes[y+1] = GetPlayerType(plr)
                end
            end
        end
    end
end

public def OnRoundStarted()
    mtfticks = GetMTFTickets()
    chaosticks = GetChaosTickets()
end

public def OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetPlayerType(shooter)
    if killerole == 7 or killerrole == 3 then
        for plr; plr < len playertypes; plr = plr + 2
            if playertypes[plr] == shootee then
                for y; y < 9; y++
                    if playertype[plr+1] == found[y] then
                        chaosticks++
                        SetChaosTickets(chaosticks)
                        break
                    end
                    if playertypes[plr+1] == scps[y] then
                        chaosticks = chaosticks + 2
                        SetChaosTickets(chaosticks)
                        break
                    end
                end
                break
            end
        end
    end            
end