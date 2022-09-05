#include "includes\multiplayer_core.inc"

global scps = [9,SE_INT]
global cd = [2,SE_INT]
global found = [5,SE_INT]
//tickets
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

playertypes = [128,SE_INT]
global mtfticks, chaosticks

def loop()
    local debounce = True
    for plr = 1; plr < 64; plr++
        if IsPlayerConnected(plr) == 1 then
            for y = 0; y < len playertypes; y = y + 2 // check if in list
                print(y)
                if playertypes[y] == plr then
                    playertypes[y+1] = GetPlayerType(plr)
                    debounce = False
                    break
                end
            end
            if debounce == True then
                for y = 0; y < 64; y = y + 2 //if not in list, add
                    if playertypes[y] == 0 then
                        playertypes[y] = plr
                        playertypes[y+1] = GetPlayerType(plr)
                        break
                    end
                end
            end
        end
    end
end

public def OnPlayerGetNewRole()
    CreateTimer("loop",1000,0) //make sure it runs after kill detect system
end

public def OnRoundStarted()
    mtfticks = GetMTFTickets()
    chaosticks = GetChaosTickets()
    print(chaosticks)
    print(mtfticks)
end

public def OnSpawnMTF()
    print(mtfticks)
    mtfticks = GetMTFTickets()
    print(mtfticks)
end

public def OnSpawnChaos()
    print(chaosticks)
    chaosticks = GetChaosTickets()
    print(chaosticks)
end

public def OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetPlayerType(shooter) //What killed
    if killerrole == 7 or killerrole == 3 then
        for plr = 0; plr < len playertypes; plr = plr + 2
            if playertypes[plr] == shootee then //Find who was killed and their previous role
                for y; y < len scps; y++
                    if playertypes[plr+1] == found[y] or playertypes[plr+1] == 13 then
                        print("foundation scum")
                        chaosticks++
                        SetChaosTickets(chaosticks)
                        return
                    end
                    if playertypes[plr+1] == scps[y] then
                        print("Good intel")
                        chaosticks = chaosticks + 2
                        SetChaosTickets(chaosticks)
                        return //end
                    end
                end
                return
            end
        end
    end  
    for staff; staff < len found; staff++ //if not cd, look for security player
        if killerrole == found[staff] then
            for plr = 0; plr < len playertypes; plr = plr + 2
                if playertypes[plr] == shootee then
                    if playertypes[plr+1] == 7 or playertypes[plr+1] == 13 then
                        print("Hostile terminated")
                        mtfticks++
                        SetMTFTickets(mtfticks)
                        break
                    else
                        for y = 0; y < len scps; y++
                            if playertypes[plr+1] == scps[y] then
                                print("SCP Instance contained")
                                mtfticks = mtfticks + 3
                                SetMTFTickets(mtfticks)
                                break
                            end
                        end
                    end
                end
            end                    
        end     
    end    
end

public def OnPlayerEscape(plr, _, escaped)
    if escaped == 7 then
        chaosticks = chaosticks + 2
        SetChaosTickets(chaosticks)
    end
    if escaped = 1 then
        mtfticks = mtfticks + 2
        SetMTFTickets(mtfticks)
    end
end