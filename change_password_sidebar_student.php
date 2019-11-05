<div class="span3" id="sidebar">
		<img id="avatar" class="img-circle" src="admin/<?php echo $row['location']; ?>">
		<?php include('count.php'); ?>
		<ul class="nav nav-list bs-docs-sidenav nav-collapse collapse">
			<li class=""><a href="dashboard_student.php"><i class="icon-chevron-right"></i><i class="icon-group"></i>&nbsp;My Class</a></li>
			<li class="">
				<a href="student_notification.php"><i class="icon-chevron-right"></i><i class="icon-info-sign"></i>&nbsp;Notification
				<?php if($not_read == '0'){
				}else{ ?>
					<span class="badge badge-important"><?php echo $not_read; ?></span>
				<?php } ?>
				</a>
			</li>
			 <li class=""><a href="student_message.php"><i class="icon-chevron-right"></i><i class="icon-envelope-alt"></i>&nbsp;Message</a></li>
			 <li class=""><a href="backpack.php"><i class="icon-chevron-right"></i><i class="icon-suitcase"></i>&nbsp;Backpack</a></li>
		</ul>
		<?php/*  include('search_other_class.php'); */ ?>	
</div>

