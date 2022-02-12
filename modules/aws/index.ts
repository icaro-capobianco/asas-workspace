import AWS from 'aws-sdk'

const makeUserData = (password: string) => (`

<powershell>

    Try{

        Write-Output "Running UserData"

        $disk = Get-Disk | where-object PartitionStyle -eq "RAW"
        Initialize-Disk -Number $disk.Number -PartitionStyle MBR -confirm:$false
        New-Partition -DiskNumber $disk.Number -UseMaximumSize -IsActive | Format-Volume -FileSystem NTFS -NewFileSystemLabel "Ephemeral" -confirm:$false
        Set-Partition -DiskNumber $disk.Number -PartitionNumber 1 -NewDriveLetter D
        NET USER Jogador "${password}"

    } Catch {
        $ErrorMessage = $_.Exception.Message
        Write-Output "PowerShell Script Exception: $ErrorMessage"
    }


</powershell>
<persist>true</persist>
`).trim()

AWS.config.update({ region: 'sa-east-1' })

const EC2 = new AWS.EC2({ apiVersion: '2016-11-15' })

export const create = async (id: string, SnapshotId: string, password: string) => {
    const data = await EC2.runInstances({
        BlockDeviceMappings: [
            {
                DeviceName: '/dev/sda1',
                Ebs: {
                    DeleteOnTermination: true,
                    Encrypted: false,
                    SnapshotId,
                    VolumeSize: 30,
                },
            },
        ],
        ClientToken: `${id}.${SnapshotId}.${password}`,
        InstanceType: 'g4dn.xlarge',
        InstanceMarketOptions: {
            SpotOptions: {
                SpotInstanceType: 'one-time'
            }
        },
        MaxCount: 1,
        MinCount: 1,
        UserData: makeUserData(password),
        SecurityGroupIds: ['sg-05b300452e6de3719'],
    }).promise()
    const instance = data.Instances?.[0]
    if ( ! instance ) {
        throw new Error('Unable to retrieve instance')
    }

    const { InstanceId, PublicIpAddress } = instance

    return {
        InstanceId,
        PublicIpAddress
    }
}

export const destroy = async (InstanceId: string) => {
    await EC2.terminateInstances( {
        InstanceIds: [InstanceId]
    } ).promise()
}

export const start = async (id: string, password: string) => {

    await EC2.waitFor('instanceStopped', {
        InstanceIds: [id]
    }).promise()

    await EC2.modifyInstanceAttribute( {
        InstanceId: id, UserData: { Value: makeUserData(password) },
    } ).promise()

    await EC2.startInstances( {
        InstanceIds: [id]
    } ).promise()

    await EC2.waitFor('instanceStatusOk', {
        InstanceIds: [id]
    }).promise()

    const data = await EC2.describeInstances({
        InstanceIds: [id]
    } ).promise()
    
    const found = data.Reservations?.find(r => r.Instances?.find(instance => instance.InstanceId === id))?.Instances?.find(instance => instance.InstanceId === id)?.PublicIpAddress
                                            
    if (!found) {
        throw new Error( 'Failed to retrieve machine Public IP' )
    } else {
        return found
    }
}

export const attachNewVolume = async ( InstanceId : string, SnapshotId : string ) => {

    const volume = await EC2.createVolume( {
        AvailabilityZone: 'sa-east-1b',
        Size : 30,
        SnapshotId : SnapshotId,
        VolumeType : 'gp2',
    } ).promise()

    const VolumeId = volume.VolumeId as string

    await EC2.waitFor('volumeAvailable', {
        VolumeIds: [VolumeId]
    }).promise()

    await EC2.waitFor('instanceStopped', {
        InstanceIds: [InstanceId],
    }).promise()

    await EC2.attachVolume( {
        Device : '/dev/sda1',
        InstanceId : InstanceId,
        VolumeId : VolumeId
    } ).promise()

    await EC2.waitFor('volumeInUse', {
        VolumeIds: [VolumeId]
    }).promise()

}

export const eraseVolume = async ( InstanceId : string ) => {
    await EC2.waitFor('instanceStopped', {
        InstanceIds: [InstanceId]
    }).promise()

    const instance = await EC2.describeInstances( {
        InstanceIds: [InstanceId]
    } ).promise()

    const VolumeId = instance.Reservations
    ?.find( i => i.Instances?.find( i => i.InstanceId === InstanceId ) )
    ?.Instances?.find( i => i.InstanceId === InstanceId )
    ?.BlockDeviceMappings?.find( d => d.Ebs?.VolumeId )
    ?.Ebs?.VolumeId as string

    await EC2.detachVolume( {
        VolumeId : VolumeId,
        Force : true
    } ).promise()

    await EC2.waitFor('volumeAvailable', {
        VolumeIds: [VolumeId]
    }).promise()

    EC2.deleteVolume( { VolumeId } ).promise().then( () => {
        console.log( 'Delete volume', VolumeId )            
    } )

}

export const stopInstance = async (id: string) => {

    await EC2.stopInstances( {
        InstanceIds: [id],
    } ).promise()

    await EC2.waitFor('instanceStopped', {
        InstanceIds: [id]
    }).promise()


}

export const replaceRoot = async (id: string, snapshot: string) => {
    await EC2.createReplaceRootVolumeTask({
        InstanceId: id,
        SnapshotId: snapshot,
    }).promise()

    await EC2.waitFor('instanceStatusOk', {
        InstanceIds: [id]
    }).promise()
}

