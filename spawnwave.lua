function ScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, spawnwave.gs is bugged
    Spawn(mtfticks,1)
    print("SpawnWaves")
end

-- mtfticks,chaosticks = 0


function Spawn(tickets,role)
    local specs = {}
    local speccounter = 0 --count the ded

    plr_loop(function(plr)
        if getplayertype(plr) == 0 then --if spectator
            specs[plr] = true
            speccounter = speccounter + 1
        end
    end)

    while tickets > 0 and speccounter > 0 --until tickets or spectators = 0, run
        plr = rand(0,65) --pick random player
        index = specs[plr]
        if isplayerconnected(plr) == 1 and index == true then
            setplayertype(plr,role)
            specs[plr] = false
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
    end

    return tickets
end

function Annouc()
    --
end

function spawnmtf()
    mtfticks = Spawn(mtfticks,1) -- Call Spawn function and spawn then as role 1 (NTF operator)
    servermessage("Epsilon-11 has entered the facility")
    local announcement
    if type(OnSpawnMTF) == "function" then announcement = OnSpawnMTF() end-- manually call mtf spawn event
    if not announcement then announcement = [[SFX\Character\MTF\Announc.ogg]] end -- if no value, use default announcement
    Announc(announcement) --announcement
end

function spawnchaos()
    chaosticks = Spawn(mtfticks,1)
    servermessage("Chaos Insurgency Strike Team detected")
    if type(OnSpawnChaos) == "function" then Announc(OnSpawnChaos()) end
end