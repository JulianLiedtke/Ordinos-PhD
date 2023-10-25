<template>
    <br>
    <q-card class="card-middle">
        <q-card-section class="bg-accent"> {{ $t('ArchitectureExplained.architecture_title') }} </q-card-section>
          <q-card-section>
            {{ $t('ArchitectureExplained.architecture_introduction') }}
            <br />
              <br />
              <q-separator></q-separator>
              <br />
              <strong>{{ $t('ArchitectureExplained.bulletin_board_server_title') }}</strong>
              <br />
              {{ $t('ArchitectureExplained.bulletin_board_server_description_1') }}
              <br />
              <br />
              GET: getVotes, getConfig, getMessages, getMessagesFull, getResults
              <br />
              POST: addVote, addBulletinBoard, addHash, addMessage, addResult
              <br />
              <br />
              {{ $t('ArchitectureExplained.bulletin_board_server_description_2') }}
              <br />
              <br />
              <q-separator></q-separator>
              <br />
              <strong>{{ $t('ArchitectureExplained.authentification_server_title') }}</strong>
              <br />
              {{ $t('ArchitectureExplained.authentification_server_description_1') }}
              <br />
              <br />
              POST: addBallot, createElection, triggerEvaluation
              <br />
              <br />
              {{ $t('ArchitectureExplained.authentification_server_description_2') }}
              <br />
              <br />
              <q-separator></q-separator>
              <br />
              <strong>{{ $t('ArchitectureExplained.trustee_server_title') }}</strong>
              <br />
              {{ $t('ArchitectureExplained.trustee_server_description') }}
              <br />
              <br />
              GET: status, protocol
              <br />
              POST: addTrustee, protocol, evaluation
              <br />
              <br />
              <q-separator></q-separator>
              <br />
              <strong>{{ $t('ArchitectureExplained.additional_title') }}</strong>
              <br />
              {{ $t('ArchitectureExplained.additional_description') }}
              <br />
              <br />
              <a href="https://eprint.iacr.org/2020/405">Paper 2020/405</a>
              <br />
              <a href="https://eprint.iacr.org/2021/1420">Paper 2021/1420</a>
              <br />
              <a href="https://miro.com/app/board/uXjVO4dQNXA=/?share_link_id=649558823037">{{
              $t('ArchitectureExplained.sketches') }}</a>
          </q-card-section>
    </q-card>
    <br>
</template>