import { ClientSecretCredential } from '@azure/identity'
import { ComputeManagementClient } from '@azure/arm-compute'

const subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'] as string
const tenantId = process.env['AZURE_TENANT_ID'] as string
const clientId = process.env['AZURE_CLIENT_ID'] as string
const secret = process.env['AZURE_CLIENT_SECRET'] as string

const resourceGroupName = ''
const vmName = ''

const credentials = new ClientSecretCredential(tenantId, clientId, secret)

const CMC = new ComputeManagementClient(credentials, subscriptionId)

CMC.virtualMachines.beginCreateOrUpdate(resourceGroupName, vmName, {
    location: 'brazilsouth',
    priority: 'spot',
    evictionPolicy: 'Delete',
    osProfile: {
        computerName: 'SpotAttempt',
        adminUsername: 'NuvemAdmin',
        windowsConfiguration: {
            provisionVMAgent: true,
            enableAutomaticUpdates: true
        },
        secrets: []
    },
    plan: {
        name: 'unreal-engine',
        publisher: 'epicgames',
        product: 'unreal-engine',
    },
    hardwareProfile: {
        vmSize: 'Standard_NC4as_T4_v3',
    },
    storageProfile: {
        imageReference: {
            publisher: 'epicgames',
            offer: 'unreal-engine',
            sku: 'unreal-engine',
            version: 'latest'
        },
        osDisk: {
            osType: 'Windows',
            name: 'Default',
            
            createOption: 'FromImage',
            managedDisk: {
                
            }
        },
        dataDisks: []
    },
    networkProfile: {
        networkInterfaces: [
            {
                id: '',
                deleteOption: 'Detach'
            }
        ]
    }
})

