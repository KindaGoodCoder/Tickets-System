#include "includes\multiplayer_core.inc"

public mtfticks,chaosticks

public def SpawnMTF()
    mtfticks = Spawn(mtfticks,1)
    local annoucement = OnSpawnMTF() //manually call mtf spawn event
    local pain //false variable to act as a confirmation that OnSpawnMTF did not return a value
    if annoucement == pain then
        annoucement = "SFX\Character\MTF\Announc.ogg"
    end
    Announc(annoucement)
end

def Announc(annoucement)
    for plr; plr < 65; plr++ //play sound for each connected player in server
        if IsPlayerConnected(plr) then
            PlaySound(plr,annoucement)
        end
    end
end

public def SpawnChaos()
    chaosticks = Spawn(chaosticks,7)
    local annoucement = OnSpawnChaos() //Manually call chaos spawn event
    local pain //false variable to act as a confirmation that OnSpawnChaos did not return a value
    if annoucement != pain then
        Announc(annoucement)
    end
end

def Spawn(tickets,role) //Determine spawnwave mechanic
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
    while tickets > 0 and speccounter > 0
        index = rand(1,62)
        plr = specs[index]
        if IsPlayerConnected(plr) == 1 then
            SetPlayerType(plr,role)
            specs[index] = 0
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
    end
    return tickets
end