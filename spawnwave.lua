function ScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, spawnwave.gs is bugged
    print("SpawnWaves")
end

-- mtfticks,chaosticks = 0

function spawnmtf()
    mtfticks = Spawn(mtfticks,1) -- Call Spawn function and spawn then as role 1 (NTF operator)
    servermessage("Epsilon-11 has entered the facility")
    local announcement
    if type(onspawnmtf) == "function" then announcement = onspawnmtf() end-- manually call mtf spawn event
    if not announcement then announcement = [[SFX\Character\MTF\Announc.ogg]] end -- if no value, use default announcement
    -- Announc(announcement) --announcement
end

function Spawn()
    --
end