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
global mtfticks, chaosticks

public def OnScriptLoaded()
    for x = 0; x < 128; x = x + 2 //For every second slot in the list, add possible player number, should support 64 players
        playertypes[x] = x/2 + 1 //Mathmatic genius
    end
end

def loop(plr, role)
    for x = 0; x < 128; x = x + 2
        if playertypes[x] == plr then
            playertypes[x+1] = role
            break
        end
    end
end

public def OnPlayerGetNewRole(plr, role)
    CreateTimer("loop", 5000, 0, plr, role) //make sure it runs after kill detect system
end

public def OnRoundStarted()
    SetMTFTickets(10)
    SetChaosTickets(10)
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
        for plr = 0; plr < 130; plr = plr + 2
            print("needstobereason")
            if playertypes[plr] == shootee then //Find who was killed and their previous role
                role = playertypes[y+1]
                for y; y < 9; y++
                    print("work")
                    if role == found[y] or role == 13 then
                        print("foundation scum")
                        chaosticks++
                        break
                    end
                    if role == scps[y] then
                        print("Good intel")
                        chaosticks = chaosticks + 2
                        break
                    end
                end     
                SetChaosTickets(chaosticks)           
                return
            end
        end
    end  
    for staff; staff < 5; staff++ //if not cd, look for security player
        if killerrole == found[staff] then
            for plr = 0; plr < 130; plr = plr + 2
                if playertypes[plr] == shootee then
                    role = playertypes[plr+1]
                    if role == 7 or role == 13 then
                        print("Hostile terminated")
                        mtfticks++                        
                        break
                    else
                        for y = 0; y < 9; y++
                            if role == scps[y] then
                                print("SCP Instance contained")
                                mtfticks = mtfticks + 3
                                break
                            end
                        end
                    end
                    SetMTFTickets(mtfticks)
                    return  
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
    if escaped == 1 then
        mtfticks = mtfticks + 2
        SetMTFTickets(mtfticks)
    end
end