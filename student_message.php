<?php include('header_dashboard.php'); ?>
<?php include('session.php'); ?>
<body>
		<?php include('navbar_student.php'); ?>
        <div class="container-fluid">
            <div class="row-fluid">
				<?php include('student_message_sidebar.php'); ?>
               <div class="span6" id="content">
                     <div class="row-fluid">
					    <!-- breadcrumb -->
					     <ul class="breadcrumb">
								<?php
								$school_year_query = mysqli_query($conn,"select * from school_year order by school_year DESC")or die(mysqli_error());
								$school_year_query_row = mysqli_fetch_array($school_year_query);
								$school_year = $school_year_query_row['school_year'];
								?>
								<li><a href="#">Message</a><span class="divider">/</span></li>
								<li><a href="#"><b>Inbox</b></a><span class="divider">/</span></li>
								<li><a href="#">School Year: <?php echo $school_year_query_row['school_year']; ?></a></li>
						</ul>
						 <!-- end breadcrumb -->

                        <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-left"></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
								<form action="read_message.php" method="post">
										<div class="pull-right">
											<button class="btn btn-info" name="read"><i class="icon-check"></i> Read</button>

							Check All <input type="checkbox"  name="selectAll" id="checkAll" />
								<script>
								$("#checkAll").click(function () {
									$('input:checkbox').not(this).prop('checked', this.checked);
								});
								</script>

										</div>

										<ul class="nav nav-pills">
										<li class="active"><a href="student_message.php"><i class="icon-envelope-alt"></i>inbox</a></li>
										<li class=""><a href="sent_message_student.php"><i class="icon-envelope-alt"></i>Send messages</a></li>
										</ul>

									<?php
								 $query_announcement = mysqli_query($conn,"select * from message
																	LEFT JOIN student ON student.student_id = message.sender_id
																	where  message.reciever_id = '$session_id' order by date_sended DESC
																	")or die(mysqli_error());
								$count_my_message = mysqli_num_rows($query_announcement);
								if ($count_my_message != '0'){
								 while($row = mysqli_fetch_array($query_announcement)){
								 $id = $row['message_id'];
								 								 $id_2 = $row['message_id'];
								 $status = $row['message_status'];
								 $sender_id = $row['sender_id'];
								 $sender_name = $row['sender_name'];
								 $reciever_name = $row['reciever_name'];
								 ?>
											<div class="post"  id="del<?php echo $id; ?>">
											<div class="message_content">
											<?php echo $row['content']; ?>
											</div>
											<div class="pull-right">
											<?php if ($status == 'read'){
											}else{ ?>
											<input id="" class="" name="selector[]" type="checkbox" value="<?php echo $id; ?>">
											<?php } ?>
											</div>
													<hr>
											Send by: <strong><?php echo $row['sender_name']; ?></strong>
											<i class="icon-calendar"></i> <?php echo $row['date_sended']; ?>
														<div class="pull-right">
															<a class="btn btn-link"  href="#reply<?php echo $id; ?>" data-toggle="modal" ><i class="icon-reply"></i> Reply </a>
														</div>
													<div class="pull-right">
													<a class="btn btn-link"  href="#<?php echo $id; ?>" data-toggle="modal" ><i class="icon-remove"></i> Remove </a>
													<?php include("remove_inbox_message_modal.php"); ?>
													<?php include("reply_inbox_message_modal_student.php"); ?>
													</div>
											</div>

								<?php }}else{ ?>
								<div class="alert alert-info"><i class="icon-info-sign"></i> No Message Inbox</div>
								<?php } ?>
								</form>
                                </div>
                            </div>
                        </div>
                        <!-- /block -->
                    </div>

<script type="text/javascript">
	$(document).ready( function() {
		$('.remove').click( function() {
		var id = $(this).attr("id");
			$.ajax({
			type: "POST",
			url: "remove_inbox_message.php",
			data: ({id: id}),
			cache: false,
			success: function(html){
			$("#del"+id).fadeOut('slow', function(){ $(this).remove();});
			$('#'+id).modal('hide');
			$.jGrowl("Your Sent message is Successfully Deleted", { header: 'Data Delete' });
			}
			});
			return false;
		});
	});
</script>
			<script>
/* 			jQuery(document).ready(function(){
			jQuery("#reply").submit(function(e){
					e.preventDefault();
					var id = $('.reply').attr("id");
					var _this = $(e.target);
					var formData = jQuery(this).serialize();
					$.ajax({
						type: "POST",
						url: "reply.php",
						data: formData,
						success: function(html){
						$.jGrowl("Message Successfully Sent", { header: 'Message Sent' });
						$('#reply'+id).modal('hide');
						}

					});
					return false;
				});
			}); */
			</script>


                </div>
				<?php include('create_message_student.php') ?>
            </div>
		<?php include('footer.php'); ?>
        </div>
		<?php include('script.php'); ?>
    </body>
</html>
