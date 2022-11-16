function ScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, spawnwave.gs is bugged
    print("SpawnWaves")
end

-- mtfticks,chaosticks = 0


function Spawn()
    --
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