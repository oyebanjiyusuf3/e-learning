		<!-- Modal -->
<div id="campuses" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
<div class="modal-body">
										<?php
											$mission_query = mysql_query("select * from content where title  = 'Campuses' ")or die(mysql_error());
											$mission_row = mysql_fetch_array($mission_query);
											echo $mission_row['content'];
										?>
</div>
<div class="modal-footer">
<button class="btn" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i> Close</button>

</div>
</div>