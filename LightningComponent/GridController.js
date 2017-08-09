({
    doInit : function(cmp) {
        var location = window.location.href;
        var forceDomain = '.force.com';
        
        // Look for a subdomain for communities, otherwise return the current location domain
        var subdomainStartPos = location.indexOf(forceDomain) + forceDomain.length + 1;
        var subdomainEndPos = location.indexOf('/', subdomainStartPos);
        var vfHost;
        
        //console.log('Subdomain start ' + subdomainStartPos + ' subdomain end ' + subdomainEndPos);
        if (subdomainEndPos > 0) {
            var subdomain = location.substring(subdomainStartPos, subdomainEndPos);
            //console.log('Subdomain: ' + subdomain);
            // If the subdomain is 'one' then we are in the internal Lightning UX
            if (subdomain == 'one') {
                vfHost = location.substring(0, subdomainStartPos);
            }
            else {
                vfHost = location.substring(0, subdomainEndPos);
            }
        }
        else {
            vfHost = location.substring(0, subdomainStartPos);
        }
        //console.log('VFHost: ' + vfHost);

        cmp.set("v.vfHost", vfHost);

        // Replace spaces etc. in grid name with URI encoded name
        var gridName = cmp.get("v.gridName");
        if (gridName.indexOf(' ')) {
            gridName = encodeURIComponent(gridName);
            cmp.set("v.gridName", gridName);
        }

    }
})
